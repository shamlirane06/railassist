import { stationLocations, stationConnections } from "../data/stationData";

const locationMap = new Map(
  stationLocations.map((location) => [location.id, location])
);

function buildGraph(accessibilityMode = false) {
  const graph = {};

  stationLocations.forEach((location) => {
    graph[location.id] = [];
  });

  stationConnections.forEach(([from, to, distance]) => {
    const fromLocation = locationMap.get(from);
    const toLocation = locationMap.get(to);

    if (!fromLocation || !toLocation) return;

    // In accessibility mode, avoid non-accessible locations.
    if (
      accessibilityMode &&
      (!fromLocation.accessible || !toLocation.accessible)
    ) {
      return;
    }

    graph[from].push({
      id: to,
      distance,
    });

    graph[to].push({
      id: from,
      distance,
    });
  });

  return graph;
}

export function findRoute(
  startId,
  destinationId,
  accessibilityMode = false
) {
  if (startId === destinationId) {
    return {
      locations: [locationMap.get(startId)],
      distance: 0,
      walkingTime: 0,
      instructions: ["You are already at your destination."],
    };
  }

  const graph = buildGraph(accessibilityMode);

  if (!graph[startId] || !graph[destinationId]) {
    return null;
  }

  const distances = {};
  const previous = {};
  const unvisited = new Set(Object.keys(graph));

  Object.keys(graph).forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
  });

  distances[startId] = 0;

  while (unvisited.size > 0) {
    let current = null;
    let shortestDistance = Infinity;

    for (const id of unvisited) {
      if (distances[id] < shortestDistance) {
        shortestDistance = distances[id];
        current = id;
      }
    }

    if (current === null) break;

    unvisited.delete(current);

    if (current === destinationId) break;

    for (const neighbor of graph[current]) {
      if (!unvisited.has(neighbor.id)) continue;

      const newDistance =
        distances[current] + neighbor.distance;

      if (newDistance < distances[neighbor.id]) {
        distances[neighbor.id] = newDistance;
        previous[neighbor.id] = current;
      }
    }
  }

  if (distances[destinationId] === Infinity) {
    return null;
  }

  const path = [];
  let current = destinationId;

  while (current !== null) {
    path.unshift(current);
    current = previous[current];
  }

  const locations = path
    .map((id) => locationMap.get(id))
    .filter(Boolean);

  const distance = distances[destinationId];

  // Average walking speed: approximately 1.3 m/s.
  const walkingTime = Math.max(1, Math.ceil(distance / 1.3 / 60));

  const instructions = createInstructions(locations);

  return {
    locations,
    distance,
    walkingTime,
    instructions,
  };
}

function createInstructions(locations) {
  if (locations.length <= 1) {
    return ["You are already at your destination."];
  }

  const instructions = [];

  instructions.push(`Start at ${locations[0].name}.`);

  for (let i = 1; i < locations.length; i++) {
    const current = locations[i];

    if (current.type === "Elevator") {
      instructions.push("Take the elevator.");
    } else if (current.type === "Escalator") {
      instructions.push("Take the escalator.");
    } else if (current.type === "Exit") {
      instructions.push(`Continue toward ${current.name}.`);
    } else if (current.type === "Toilet") {
      instructions.push(`Continue to ${current.name}.`);
    } else if (current.type === "Platform") {
      instructions.push(`Continue to ${current.name}.`);
    } else {
      instructions.push(`Continue toward ${current.name}.`);
    }
  }

  instructions.push(
    `You have reached ${locations[locations.length - 1].name}.`
  );

  return instructions;
}