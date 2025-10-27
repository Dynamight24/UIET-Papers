import React, { useMemo, useState, useEffect } from "react";
import "./App.css";
import { AiOutlineEye, AiOutlineLoading3Quarters } from "react-icons/ai";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://pyq-backend-yzz5.onrender.com";

export default function App() {
  const [filters, setFilters] = useState({
    branch: "",
    subject: "",
    year: "",
    semester: "",
    examType: "",
  });
  const [papers, setPapers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState({
    title: "",
    branch: "",
    subject: "",
    year: "",
    semester: "",
    examType: "",
  });
  const [message, setMessage] = useState("");

  const branches = ["CSE", "IT", "ECE", "EEE", "ME", "BIOTECH"];

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    return params.toString();
  }, [filters]);

  // Load approved papers
  const load = async () => {
    try {
      setSearchLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/papers?${query}`);
      setPapers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load();
  };

  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Choose a PDF");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("File exceeds 5 MB limit");
      return;
    }

    try {
      setUploadLoading(true);

      const form = new FormData();
      const metaPayload = { ...meta, year: Number(meta.year), semester: Number(meta.semester) };
      form.append("meta", new Blob([JSON.stringify(metaPayload)], { type: "application/json" }));
      form.append("file", file);
      

      const res = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed : Hey buddy Please upload a UIET exam paper, no random stuff allowed, Limited storage :( ");

      setMessage("Upload successful ✔");
      setFile(null);
      setMeta({ title: "", branch: "", subject: "", year: "", semester: "", examType: "" });
      load(); // Refresh list
    } catch (err) {
      setMessage( err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>UIET Past Papers</h1>

      {/* Friendly Description */}
      <section className="description">
        <p>
          I've tried to make finding previous years' question papers during exam season a lot easier for you.🫰🏻
          <br />
          To make this a useful resource for yourself and upcoming UIETians, please contribute by adding papers with the correct title, branch, year, and a proper description.♥️ 📚
          (Due to server limitation, the web application works a little slow.... working on optimising it :)).
        </p>
      </section>

      {/* Search Section */}
      <section className="section-card">
        <h2>Search Papers</h2>
        <form onSubmit={onSearch} className="grid-form">
          <select value={filters.branch} onChange={(e) => setFilters((f) => ({ ...f, branch: e.target.value }))}>
            <option value="">Branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <input
            placeholder="Subject"
            value={filters.subject}
            onChange={(e) => setFilters((f) => ({ ...f, subject: e.target.value }))}
          />
          <input
            placeholder="Year"
            type="number"
            value={filters.year}
            onChange={(e) => setFilters((f) => ({ ...f, year: e.target.value }))}
          />
          <input
            placeholder="Semester"
            type="number"
            value={filters.semester}
            onChange={(e) => setFilters((f) => ({ ...f, semester: e.target.value }))}
          />
          <select value={filters.examType} onChange={(e) => setFilters((f) => ({ ...f, examType: e.target.value }))}>
            <option value="">Exam Type</option>
            <option value="MIDSEM">MIDSEM</option>
            <option value="ENDSEM">ENDSEM</option>
          </select>
          <button type="submit" className="search-btn" disabled={searchLoading}>
            {searchLoading ? <span className="spinner"><AiOutlineLoading3Quarters size={18} /> Searching...</span> : "Search"}
          </button>
        </form>
      </section>

      {/* Upload Section */}
      <section className="section-card">
        <h2>Upload Paper</h2>
        <form onSubmit={onUpload} className="grid-form">
          <input
            placeholder="Title"
            value={meta.title}
            onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
            required
          />
          <select
            value={meta.branch}
            onChange={(e) => setMeta((m) => ({ ...m, branch: e.target.value }))}
            required
          >
            <option value="">Branch</option>
            {branches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <input
            placeholder="Subject"
            value={meta.subject}
            onChange={(e) => setMeta((m) => ({ ...m, subject: e.target.value }))}
            required
          />
          <input
            placeholder="Year"
            type="number"
            value={meta.year}
            onChange={(e) => setMeta((m) => ({ ...m, year: e.target.value }))}
            required
          />
          <input
            placeholder="Semester"
            type="number"
            value={meta.semester}
            onChange={(e) => setMeta((m) => ({ ...m, semester: e.target.value }))}
            required
          />
          <select
            value={meta.examType}
            onChange={(e) => setMeta((m) => ({ ...m, examType: e.target.value }))}
          >
            <option value="">Exam Type</option>
            <option value="MIDSEM">MIDSEM</option>
            <option value="ENDSEM">ENDSEM</option>
          </select>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              if (selected) {
                const sizeMB = (selected.size / (1024 * 1024)).toFixed(2);
                if (sizeMB > 5) setMessage(`File too large (${sizeMB} MB). Max 5 MB. Please compress it.`);
                else setMessage(`Selected file: ${selected.name} (${sizeMB} MB)`);
              } else setMessage("");
            }}
          />
          <button
            type="submit"
            className="upload-btn"
            disabled={uploadLoading || (file && file.size > 5 * 1024 * 1024)}
          >
            {uploadLoading ? <span className="spinner"><AiOutlineLoading3Quarters size={18} /> Uploading...</span> : "Upload"}
          </button>
          <div className={`form-message ${file && file.size > 5 * 1024 * 1024 ? "error" : ""}`}>{message}</div>
        </form>
      </section>

      {/* Results Section */}
      <section className="section-card table-wrapper">
        <h2>Results ({papers.length})</h2>
        {searchLoading ? (
          <p>Loading...</p>
        ) : papers.length === 0 ? (
          <p>No papers to display. Use search to load papers.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Branch</th>
                <th>Subject</th>
                <th>Year</th>
                <th>Sem</th>
                <th>Type</th>
                <th>File</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((p) => (
                <tr key={p.id}>
                  <td>{p.title}</td>
                  <td>{p.branch}</td>
                  <td>{p.subject}</td>
                  <td align="center">{p.year}</td>
                  <td align="center">{p.semester}</td>
                  <td align="center">{p.examType}</td>
                  <td>
                    <a href={p.fileUrl} target="_blank" rel="noreferrer" title="View Paper">
                      <AiOutlineEye size={20} style={{ color: "#555" }} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Fun Footer */}
      <div className="fun-footer">
        <span>Liked my project? Buy me GTA 6! 🎮</span>
        <a
          href="https://drive.google.com/file/d/1qsvJ1ymNztSjLyhSjmM3rcK-Yf4akoqe/view?usp=drive_link"
          target="_blank"
          rel="noreferrer"
        >
          <img src="/qr.png" alt="" className="qr-img" />
        </a>
      </div>
    </div>
  );
}
