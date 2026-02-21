import { useEffect, useState } from "react";
import axios from "axios";

const RolePlayHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const rawTokens = localStorage.getItem("brightskill_tokens");
        const token = rawTokens ? JSON.parse(rawTokens)?.access : null;
        const { data } = await axios.get("/api/roleplay/history/", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setSessions(data);
      } catch (error) {
        console.error("Failed to load role-play history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <p>Loading role-play history...</p>;

  return (
    <div>
      <h3>Role-Play History</h3>
      {sessions.length === 0 && <p>No previous sessions yet.</p>}
      {sessions.map((session) => (
        <div key={session.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 12 }}>
          <button type="button" onClick={() => setExpanded(expanded === session.id ? null : session.id)}>
            Session #{session.id} ({new Date(session.started_at).toLocaleString()})
          </button>
          {expanded === session.id && (
            <div style={{ marginTop: 8 }}>
              {session.messages.map((message) => (
                <p key={message.id}>
                  <strong>{message.role.toUpperCase()}:</strong> {message.content}
                </p>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RolePlayHistory;
