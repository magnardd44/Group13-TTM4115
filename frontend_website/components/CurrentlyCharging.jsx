export const CurrentlyCharging = ({ presentage }) => {
  return (
    <>
      {/* <p className="text-xl">Charging...</p> */}
      <div className={presentage !== 100 ? "battery" : "battery2"}>
        <div className="flex justify-center items-center flex-col h-full">
          <p className="text-xl relative font-semibold">Charging...</p>
          <p className="relative text-xl">{presentage}%</p>
        </div>
      </div>
    </>
  );
};
