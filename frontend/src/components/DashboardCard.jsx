function DashboardCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h3 className="text-gray-500 text-sm">
        {title}
      </h3>

      <h1 className="text-3xl font-bold mt-2">
        {value}
      </h1>
    </div>
  );
}

export default DashboardCard;