import { ImageResponse } from "next/og";

export async function GET() {
  const planName = "Plan Name";
  return new ImageResponse(
    (
      <div
        tw="w-[1200px] h-[600px] flex items-center justify-center"
        style={{
          background: "linear-gradient(-65deg, #CCC 0%, #666 100%)",
        }}
      >
        <center tw="flex-col !items-center !flex bg-white px-8 py-4 rounded-lg shadow-lg border border-gray-600">
          <h1 tw="text-7xl text-center text-black ">{planName}</h1>
          <p tw="text-black items-center !text-center mx-auto">
            This is a plan description
          </p>
        </center>
      </div>
    ),
    {
      width: 1200,
      height: 600,
    }
  );
}
