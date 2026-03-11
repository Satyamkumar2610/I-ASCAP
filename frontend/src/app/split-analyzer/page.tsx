import React from "react";
import AppLayout from "../components/AppLayout";
import DistrictSplitAnalyzer from "../components/DistrictSplitAnalyzer";

export default function SplitAnalyzerPage() {
    return (
        <AppLayout>
            <div className="p-6 h-[calc(100vh-64px)] overflow-hidden">
                <DistrictSplitAnalyzer />
            </div>
        </AppLayout>
    );
}
