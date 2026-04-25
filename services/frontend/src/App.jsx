import { useEffect, useState } from "react";

function App() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");

    ws.onopen = () => {
      console.log("Connected to WebSocket");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setCounts((prev) => {
        const updated = { ...prev };
        updated[data.option] = (updated[data.option] || 0) + 1;
        return updated;
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>📊 Live Survey Results</h1>

      {Object.keys(counts).length === 0 ? (
        <p>No data yet...</p>
      ) : (
        <ul>
          {Object.entries(counts).map(([option, count]) => (
            <li key={option}>
              {option} : {count}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
