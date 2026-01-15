import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Get title from query params or use default
        const title = searchParams.get('title') || 'Life feels complete with you—will you walk beside me as my spouse?'
        const subtitle = searchParams.get('subtitle') || 'A special moment awaits...'

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: 32,
                        fontWeight: 600,
                        position: 'relative',
                    }}
                >
                    {/* Decorative elements */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '50px',
                            left: '50px',
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '50px',
                            right: '50px',
                            width: '150px',
                            height: '150px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                        }}
                    />

                    {/* Main content */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '40px',
                            maxWidth: '1000px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: '60px',
                                marginBottom: '20px',
                            }}
                        >
                            💍✨💕
                        </div>

                        <div
                            style={{
                                color: 'white',
                                fontSize: '48px',
                                fontWeight: 'bold',
                                marginBottom: '30px',
                                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                                lineHeight: 1.2,
                            }}
                        >
                            A Special Moment Awaits
                        </div>

                        <div
                            style={{
                                color: 'rgba(255,255,255,0.9)',
                                fontSize: '28px',
                                fontWeight: 400,
                                textAlign: 'center',
                                lineHeight: 1.4,
                                maxWidth: '800px',
                            }}
                        >
                            {title.length > 80 ? title.substring(0, 80) + '...' : title}
                        </div>

                        <div
                            style={{
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: '24px',
                                fontStyle: 'italic',
                                marginTop: '40px',
                            }}
                        >
                            {subtitle}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        )
    } catch (e: any) {
        console.log(`${e.message}`)
        return new Response(`Failed to generate the image`, {
            status: 500,
        })
    }
}