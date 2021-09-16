import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Get } from 'ajwahjs'
import { AnalyserState } from '../state//AnalyserState';
import { useStream } from '../hooks';
import { map } from 'rxjs/operators';
const Histogram = () => {
    const ctrl = Get(AnalyserState)
    const data = useStream(ctrl.stream$.pipe(map(s => s.histogram)), {});
    return <div>
        <Bar data={data} />
    </div>;
}
export default Histogram;