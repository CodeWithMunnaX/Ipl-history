import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    
    // Mock team data for now
    const mockTeams: Record<string, any> = {
      '1': {
        id: 1,
        team_id: 1,
        team_name: 'Mumbai Indians',
        team_name_short: 'MI',
        city: 'Mumbai',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/200px-Mumbai_Indians_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/200px-Mumbai_Indians_Logo.svg.png'
      },
      '2': {
        id: 2,
        team_id: 2,
        team_name: 'Chennai Super Kings',
        team_name_short: 'CSK',
        city: 'Chennai',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/200px-Chennai_Super_Kings_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/200px-Chennai_Super_Kings_Logo.svg.png'
      },
      '3': {
        id: 3,
        team_id: 3,
        team_name: 'Royal Challengers Bangalore',
        team_name_short: 'RCB',
        city: 'Bangalore',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Royal_Challengers_Bangalore_Logo.svg/200px-Royal_Challengers_Bangalore_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6a/Royal_Challengers_Bangalore_Logo.svg/200px-Royal_Challengers_Bangalore_Logo.svg.png'
      },
      '4': {
        id: 4,
        team_id: 4,
        team_name: 'Kolkata Knight Riders',
        team_name_short: 'KKR',
        city: 'Kolkata',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/200px-Kolkata_Knight_Riders_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/200px-Kolkata_Knight_Riders_Logo.svg.png'
      },
      '5': {
        id: 5,
        team_id: 5,
        team_name: 'Delhi Capitals',
        team_name_short: 'DC',
        city: 'Delhi',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/200px-Delhi_Capitals_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/200px-Delhi_Capitals_Logo.svg.png'
      },
      '6': {
        id: 6,
        team_id: 6,
        team_name: 'Punjab Kings',
        team_name_short: 'PBKS',
        city: 'Mohali',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Punjab_Kings_Logo.svg/200px-Punjab_Kings_Logo.svg.png'
      },
      '7': {
        id: 7,
        team_id: 7,
        team_name: 'Rajasthan Royals',
        team_name_short: 'RR',
        city: 'Jaipur',
        established: '2008',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/200px-Rajasthan_Royals_Logo.svg.png'
      },
      '8': {
        id: 8,
        team_id: 8,
        team_name: 'Sunrisers Hyderabad',
        team_name_short: 'SRH',
        city: 'Hyderabad',
        established: '2013',
        image_url: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad_logo.svg/200px-Sunrisers_Hyderabad_logo.svg.png',
        logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad_logo.svg/200px-Sunrisers_Hyderabad_logo.svg.png'
      }
    };

    const team = mockTeams[teamId];
    
    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
