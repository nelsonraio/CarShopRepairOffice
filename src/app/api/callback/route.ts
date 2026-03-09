import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      {
        success: false,
        message: "Parametro 'code' nao foi enviado."
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    code
  });
}
