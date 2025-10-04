import { NextRequest, NextResponse } from "next/server";

let carControls = {
  speed: 50,
  direction: { x: 0, y: 0 },
  lights: {
    headlights: false,
    taillights: false,
    leftTurn: false,
    rightTurn: false,
    brake: false,
    reverse: false,
    fog: false,
  },
  turbo: false,
};

export async function GET() {
  return NextResponse.json(carControls);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    carControls = { ...carControls, ...data };
    return NextResponse.json({ success: true, controls: carControls });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Error procesando controles" },
      { status: 500 }
    );
  }
}
