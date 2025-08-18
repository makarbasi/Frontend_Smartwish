import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    
    // Determine the API endpoint based on query parameter
    let apiUrl = 'https://smartwish.onrender.com/marketplace'
    if (query) {
      apiUrl = `https://smartwish.onrender.com/marketplace/search?q=${encodeURIComponent(query)}`
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching marketplace data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch marketplace data' },
      { status: 500 }
    )
  }
}