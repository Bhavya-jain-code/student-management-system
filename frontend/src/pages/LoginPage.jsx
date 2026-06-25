import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LoginPage() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);

const navigate = useNavigate();

const handleLogin = async (e) => {
e.preventDefault();


if (!email || !password) {
  alert("Please fill all fields");
  return;
}

try {
  setLoading(true);

  const res = await axios.post(
    "http://localhost:3000/login",
    {
      email,
      password,
    }
  );

  console.log("LOGIN RESPONSE:", res.data);

  const { token, user } = res.data;

  if (!token || !user) {
    alert("Invalid response from server");
    return;
  }

 localStorage.setItem("token", token);
localStorage.setItem("role", user.role);
localStorage.setItem("name", user.name);
localStorage.setItem("email", user.email);

if (res.data.student_id) {
  localStorage.setItem(
    "student_id",
    res.data.student_id
  );
}

  alert(`Welcome ${user.name}`);

  if (user.role === "Admin") {
    navigate("/admin");
  } else {
    navigate("/student");
  }
} catch (err) {
  console.error(err);

  alert(
    err.response?.data?.message ||
      "Invalid Email or Password"
  );
} finally {
  setLoading(false);
}


};

return ( <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-4"> <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">


    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Welcome Back
      </h1>

      <p className="text-gray-500 mt-2">
        Login to your account
      </p>
    </div>

    <form
      onSubmit={handleLogin}
      className="space-y-5"
    >
      <div>
        <label className="block mb-2 font-medium text-gray-700">
          Email
        </label>

        <input
          type="email"
          placeholder="Enter email"
          autoComplete="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block mb-2 font-medium text-gray-700">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          autoComplete="current-password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
      >
        {loading
          ? "Logging in..."
          : "Login"}
      </button>
    </form>
  </div>
</div>


);
}

export default LoginPage;
