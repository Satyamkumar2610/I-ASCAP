
import DataVisualizer from '@/app/components/visualise/DataVisualizer';

export const metadata = {
    title: 'Data Visualiser — I-ASCAP',
    description: 'Build custom charts and visualisations from agricultural metrics across Indian districts.',
};

export default function VisualisePage() {
    return (
        <main className="page-container">
            <DataVisualizer />
        </main>
    );
}

