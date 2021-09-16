import React from 'react';
import { Bar } from 'react-chartjs-2';

const Histogram = () => {

    const data = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{
            label: 'My First dataset',
            data: [65, 59, 80, 81, 56, 55, 40],
        }]
    }
    return <div>
        <Bar data={data} />
    </div>;
}
export default Histogram;