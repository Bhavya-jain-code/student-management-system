function StudentForm() {
  return (
    <form className="bg-white p-6 rounded shadow">

      <input
        type="text"
        placeholder="Name"
        className="border p-3 w-full mb-4 rounded"
      />

      <input
        type="email"
        placeholder="Email"
        className="border p-3 w-full mb-4 rounded"
      />

      <input
        type="text"
        placeholder="Phone"
        className="border p-3 w-full mb-4 rounded"
      />

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Student
      </button>

    </form>
  );
}

export default StudentForm;