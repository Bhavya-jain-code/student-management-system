import { useState } from "react";
import api from "../services/axiosInstance";

function SearchStudent() {
  const [keyword, setKeyword] = useState("");
  const [students, setStudents] = useState([]);

  const searchStudent = async () => {
    try {
      const res = await api.get(`/students/search/${keyword}`);
      setStudents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <h2>Search Student</h2>

      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search..."
      />

      <button onClick={searchStudent}>Search</button>

      {students.map((s) => (
        <p key={s.id}>{s.name}</p>
      ))}
    </div>
  );
}

export default SearchStudent;