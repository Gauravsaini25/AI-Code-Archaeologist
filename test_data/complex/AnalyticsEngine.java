package com.example.complex;

import java.util.List;
import java.util.ArrayList;

public class AnalyticsEngine {
    private DatabaseConnector db;
    private ReportGenerator reporter;

    public AnalyticsEngine() {
        this.db = new DatabaseConnector();
        this.reporter = new ReportGenerator();
    }

    public void runAnalysis(String query) {
        List<DataPoint> data = db.fetchData(query);
        DataResult result = process(data);
        reporter.generate(result);
    }

    private DataResult process(List<DataPoint> data) {
        // Heavy computation
        return new DataResult(data.size());
    }
}
