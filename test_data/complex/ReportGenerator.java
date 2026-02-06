package com.example.complex;

public class ReportGenerator {
    public void generate(DataResult result) {
        System.out.println("Report: " + result.toString());
        FormattingUtils.prettyPrint(result);
    }
}
