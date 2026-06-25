function StudentTable({ students }) {
  return (
    <div className="bg-white rounded-lg shadow">

      <table className="w-full">

        <thead>
          <tr className="bg-gray-100">

            <th className="p-3 text-left">
              ID
            </th>

            <th className="p-3 text-left">
              Name
            </th>

            <th className="p-3 text-left">
              Email
            </th>

            <th className="p-3 text-left">
              Phone
            </th>

          </tr>
        </thead>

        <tbody>

          {students.map((student) => (
            <tr
              key={student.id}
              className="border-b"
            >
              <td className="p-3">
                {student.id}
              </td>

              <td className="p-3">
                {student.name}
              </td>

              <td className="p-3">
                {student.email}
              </td>

              <td className="p-3">
                {student.phone}
              </td>
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default StudentTable;