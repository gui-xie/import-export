use criterion::{BatchSize, BenchmarkId, Criterion, Throughput, criterion_group, criterion_main};
use imexport_wasm::{
    ExcelColumnData, ExcelColumnInfo, ExcelData, ExcelInfo, ExcelRowData, benchmark_export_data,
    benchmark_import_data,
};

fn create_excel_info() -> ExcelInfo {
    ExcelInfo::new(
        "Benchmark Export",
        "sheet1",
        vec![
            ExcelColumnInfo::new("id", "ID").with_data_type("number"),
            ExcelColumnInfo::new("name", "Name"),
            ExcelColumnInfo::new("score", "Score").with_data_type("number"),
            ExcelColumnInfo::new("created_at", "Created At").with_data_type("date"),
            ExcelColumnInfo::new("notes", "Notes"),
        ],
        "senlinz",
        "2024-11-01T08:00:00",
    )
    .expect("benchmark schema should be valid")
}

fn create_excel_data(row_count: usize) -> ExcelData {
    let rows = (0..row_count)
        .map(|index| {
            ExcelRowData::new(vec![
                ExcelColumnData::new("id", index.to_string()),
                ExcelColumnData::new("name", format!("Row {index}")),
                ExcelColumnData::new("score", ((index % 100) + 1).to_string()),
                ExcelColumnData::new(
                    "created_at",
                    format!("2024-11-{:02}", (index % 28) + 1),
                ),
                ExcelColumnData::new(
                    "notes",
                    format!("Benchmark row {index} for import/export throughput measurement."),
                ),
            ])
        })
        .collect();
    ExcelData::new(rows)
}

fn benchmark_large_dataset(c: &mut Criterion) {
    let runtime = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .expect("benchmark runtime should initialize");
    let mut group = c.benchmark_group("large_dataset");

    for row_count in [1_000usize, 5_000usize] {
        let seed_data = create_excel_data(row_count);
        let import_bytes = runtime
            .block_on(benchmark_export_data(create_excel_info(), seed_data.clone()))
            .expect("benchmark workbook should be generated");

        group.throughput(Throughput::Elements(row_count as u64));
        group.bench_with_input(BenchmarkId::new("export", row_count), &seed_data, |b, data| {
            b.to_async(&runtime).iter_batched(
                || (create_excel_info(), data.clone()),
                |(info, data)| async move {
                    benchmark_export_data(info, data)
                        .await
                        .expect("benchmark export should succeed");
                },
                BatchSize::LargeInput,
            );
        });

        group.bench_function(BenchmarkId::new("import", row_count), |b| {
            b.iter_batched(
                create_excel_info,
                |info| {
                    benchmark_import_data(info, &import_bytes)
                        .expect("benchmark import should succeed");
                },
                BatchSize::LargeInput,
            );
        });
    }

    group.finish();
}

criterion_group!(benches, benchmark_large_dataset);
criterion_main!(benches);
