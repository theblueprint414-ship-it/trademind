import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#070B14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: "2.5px solid #4F8EF7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4F8EF7",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size }
  );
}