import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function MarketChart({ data, category, dataSource }) {
  if (!data) return null;

  const years = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Market Data',
        data: values,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ marginTop: '20px', width: '600px', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
      {category && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '10px',
          color: '#333'
        }}>
          {category}
        </div>
      )}
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: 'Market Data by Year',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
      {dataSource && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '14px', 
          marginTop: '10px',
          color: '#666',
          fontStyle: 'italic'
        }}>
          Data Source: {dataSource}
        </div>
      )}
    </div>
  );
}

export default MarketChart; 