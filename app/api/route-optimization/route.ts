import { NextRequest, NextResponse } from "next/server";

interface Location {
    name: string;
    lat: number;
    lng: number;
    priority?: number;
}

// Simple implementation of Traveling Salesman Problem using nearest neighbor heuristic
function optimizeRoute(locations: Location[], startIndex: number = 0): Location[] {
    if (locations.length <= 2) return locations;

    const visited = new Set<number>();
    const optimizedRoute: Location[] = [];
    let currentIndex = startIndex;

    // Start with the first location
    optimizedRoute.push(locations[currentIndex]);
    visited.add(currentIndex);

    while (visited.size < locations.length) {
        let nearestIndex = -1;
        let minDistance = Infinity;

        // Find nearest unvisited location
        for (let i = 0; i < locations.length; i++) {
            if (!visited.has(i)) {
                const distance = calculateDistance(
                    locations[currentIndex].lat,
                    locations[currentIndex].lng,
                    locations[i].lat,
                    locations[i].lng
                );
                
                // Consider priority in distance calculation
                const adjustedDistance = distance / (locations[i].priority || 1);
                
                if (adjustedDistance < minDistance) {
                    minDistance = adjustedDistance;
                    nearestIndex = i;
                }
            }
        }

        if (nearestIndex !== -1) {
            optimizedRoute.push(locations[nearestIndex]);
            visited.add(nearestIndex);
            currentIndex = nearestIndex;
        }
    }

    return optimizedRoute;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function calculateTotalDistance(route: Location[]): number {
    let total = 0;
    for (let i = 0; i < route.length - 1; i++) {
        total += calculateDistance(
            route[i].lat,
            route[i].lng,
            route[i + 1].lat,
            route[i + 1].lng
        );
    }
    return total;
}

function estimateTravelTime(distance: number, mode: string = 'driving'): number {
    // Average speeds in km/h
    const speeds = {
        walking: 5,
        driving: 50,
        public_transport: 30,
        cycling: 15
    };
    
    const speed = speeds[mode as keyof typeof speeds] || speeds.driving;
    return (distance / speed) * 60; // Return time in minutes
}

export async function POST(req: NextRequest) {
    try {
        const { locations, startLocation, travelMode = 'driving', optimizeFor = 'distance' } = await req.json();

        if (!locations || !Array.isArray(locations) || locations.length < 2) {
            return NextResponse.json({ error: "At least 2 locations are required" }, { status: 400 });
        }

        // Convert locations to proper format
        const formattedLocations: Location[] = locations.map((loc: any, index: number) => ({
            name: loc.name || `Location ${index + 1}`,
            lat: parseFloat(loc.lat || loc.latitude),
            lng: parseFloat(loc.lng || loc.longitude),
            priority: loc.priority || 1
        }));

        // Find start index if startLocation is provided
        let startIndex = 0;
        if (startLocation) {
            startIndex = formattedLocations.findIndex(loc => 
                loc.name.toLowerCase().includes(startLocation.toLowerCase())
            );
            if (startIndex === -1) startIndex = 0;
        }

        // Optimize the route
        const optimizedRoute = optimizeRoute(formattedLocations, startIndex);
        
        // Calculate metrics
        const totalDistance = calculateTotalDistance(optimizedRoute);
        const estimatedTime = estimateTravelTime(totalDistance, travelMode);
        
        // Generate turn-by-turn directions (simplified)
        const directions = optimizedRoute.map((location, index) => {
            if (index === 0) {
                return {
                    step: index + 1,
                    instruction: `Start at ${location.name}`,
                    location: location.name,
                    distance: 0,
                    duration: 0
                };
            }
            
            const prevLocation = optimizedRoute[index - 1];
            const segmentDistance = calculateDistance(
                prevLocation.lat, prevLocation.lng,
                location.lat, location.lng
            );
            const segmentTime = estimateTravelTime(segmentDistance, travelMode);
            
            return {
                step: index + 1,
                instruction: `Travel to ${location.name}`,
                location: location.name,
                distance: Math.round(segmentDistance * 100) / 100,
                duration: Math.round(segmentTime)
            };
        });

        // Calculate cost estimation (simplified)
        const costEstimation = {
            fuel: Math.round(totalDistance * 0.15 * 100) / 100, // $0.15 per km
            tolls: Math.round(totalDistance * 0.05 * 100) / 100, // $0.05 per km
            parking: optimizedRoute.length * 5, // $5 per location
            total: 0
        };
        costEstimation.total = costEstimation.fuel + costEstimation.tolls + costEstimation.parking;

        return NextResponse.json({
            optimizedRoute,
            originalRoute: formattedLocations,
            metrics: {
                totalDistance: Math.round(totalDistance * 100) / 100,
                estimatedTime: Math.round(estimatedTime),
                travelMode,
                optimizedFor
            },
            directions,
            costEstimation,
            savings: {
                distanceSaved: Math.round((calculateTotalDistance(formattedLocations) - totalDistance) * 100) / 100,
                timeSaved: Math.round(estimateTravelTime(calculateTotalDistance(formattedLocations), travelMode) - estimatedTime)
            }
        });

    } catch (error) {
        console.error('Route Optimization Error:', error);
        return NextResponse.json({ error: "Failed to optimize route" }, { status: 500 });
    }
}