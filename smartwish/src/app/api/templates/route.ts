import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const region = searchParams.get('region')
    const language = searchParams.get('language')
    const categoryId = searchParams.get('category_id')
    const limit = searchParams.get('limit')
    
    let apiUrl: URL
    
    // If category_id is provided, use the category-specific endpoint
    if (categoryId && !query && !region && !language) {
      // Use category-specific endpoint for pure category filtering
      apiUrl = new URL(`https://smartwish.onrender.com/api/simple-templates/category/${categoryId}`)
    } else {
      // Use general search endpoint for other queries
      apiUrl = new URL('https://smartwish.onrender.com/templates-enhanced/templates')
      
      if (query) {
        apiUrl.searchParams.set('q', query)
      }
      if (region && region !== 'Any region') {
        apiUrl.searchParams.set('region', region)
      }
      if (language && language !== 'Any language') {
        apiUrl.searchParams.set('language', language)
      }
      if (categoryId) {
        apiUrl.searchParams.set('category_id', categoryId)
      }
    }
    
    if (limit) {
      apiUrl.searchParams.set('limit', limit)
    }

    const response = await fetch(apiUrl.toString(), {
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
    console.error('Error fetching templates data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates data' },
      { status: 500 }
    )
  }
}