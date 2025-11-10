import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const teamId = params.id;
    
    // Mock team stats data
    const mockStats: Record<string, any> = {
      '1': {
        matches_played: 234,
        matches_won: 129,
        matches_lost: 105,
        win_percentage: 55.13,
        total_runs: 45678,
        total_wickets: 1234,
        highest_score: 235,
        lowest_score: 87,
        championships: 5,
        seasons_played: 16
      },
      '2': {
        matches_played: 234,
        matches_won: 131,
        matches_lost: 103,
        win_percentage: 55.98,
        total_runs: 46789,
        total_wickets: 1256,
        highest_score: 246,
        lowest_score: 79,
        championships: 5,
        seasons_played: 16
      },
      '3': {
        matches_played: 234,
        matches_won: 105,
        matches_lost: 129,
        win_percentage: 44.87,
        total_runs: 44567,
        total_wickets: 1198,
        highest_score: 263,
        lowest_score: 82,
        championships: 0,
        seasons_played: 16
      },
      '4': {
        matches_played: 234,
        matches_won: 118,
        matches_lost: 116,
        win_percentage: 50.43,
        total_runs: 45234,
        total_wickets: 1212,
        highest_score: 245,
        lowest_score: 85,
        championships: 3,
        seasons_played: 16
      },
      '5': {
        matches_played: 234,
        matches_won: 98,
        matches_lost: 136,
        win_percentage: 41.88,
        total_runs: 42345,
        total_wickets: 1156,
        highest_score: 231,
        lowest_score: 88,
        championships: 0,
        seasons_played: 16
      },
      '6': {
        matches_played: 234,
        matches_won: 95,
        matches_lost: 139,
        win_percentage: 40.60,
        total_runs: 41234,
        total_wickets: 1134,
        highest_score: 226,
        lowest_score: 91,
        championships: 0,
        seasons_played: 16
      },
      '7': {
        matches_played: 234,
        matches_won: 108,
        matches_lost: 126,
        win_percentage: 46.15,
        total_runs: 43456,
        total_wickets: 1178,
        highest_score: 223,
        lowest_score: 86,
        championships: 1,
        seasons_played: 16
      },
      '8': {
        matches_played: 234,
        matches_won: 112,
        matches_lost: 122,
        win_percentage: 47.86,
        total_runs: 44567,
        total_wickets: 1198,
        highest_score: 231,
        lowest_score: 89,
        championships: 1,
        seasons_played: 12
      }
    };

    const stats = mockStats[teamId];
    
    if (!stats) {
      return NextResponse.json(
        { error: 'Team stats not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
