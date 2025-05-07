const BackendOfflineMessage = () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-6xl font-bold text-red-500">
        Service Is Unavailable.
      </h1>
      {/* Easter Egg Error Code, if you know you know */}
      <p className="text-xl font-semibold mt-4">
        Error Code: 1000-01-1010-101-0-10-100
      </p>
      <p className="text-xl font-semibold mt-4">Please try again later.</p>
    </div>
  );
};

export default BackendOfflineMessage;
