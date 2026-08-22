import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
export function AdminPage() { return <main className="admin-page"><div className="admin-placeholder"><span className="admin-icon"><LockKeyhole size={28} /></span><p className="eyebrow">Administration</p><h1>Admin portal coming soon</h1><p>The secure administration portal will be available in a future release. No login credentials are stored in this public website.</p><Link to="/"><ArrowLeft size={18} /> Return to document center</Link></div></main>; }
