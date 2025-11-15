import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function Dashboard() {
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const fetchLogs = async () => {
      let { data, error } = await supabase.from('logs').select('*');
      if (!error) setLogs(data || []);
    };
    fetchLogs();
  }, []);
  return (
    <div style={{padding:'2rem'}}>
      <h2>Trinity Logs</h2>
      <ul>
        {logs.map(log=>(<li key={log.id}>{log.message}</li>))}
      </ul>
    </div>
  );
}