import json
import math
import random
import sys


def haversine_distance(lat1, lon1, lat2, lon2):

    R = 6371.0

    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlon = lon2_rad - lon1_rad
    dlat = lat2_rad - lat1_rad

    a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * \
        math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return distance


def create_distance_matrix(wilayas):
    num_wilayas = len(wilayas)
    distance_matrix = [[0 for _ in range(num_wilayas)]
                       for _ in range(num_wilayas)]

    for i in range(num_wilayas):
        for j in range(i + 1, num_wilayas):
            lat1, lon1 = wilayas[i]["lat"], wilayas[i]["long"]
            lat2, lon2 = wilayas[j]["lat"], wilayas[j]["long"]
            distance = haversine_distance(lat1, lon1, lat2, lon2)
            distance_matrix[i][j] = distance
            distance_matrix[j][i] = distance

    return distance_matrix


def calculate_total_distance(route, distance_matrix, depot_index):
    total_distance = 0
    for i in range(len(route) - 1):
        from_index = route[i]
        to_index = route[i + 1]
        total_distance += distance_matrix[from_index][to_index]

    # Add distance from depot to the first wilaya
    total_distance += distance_matrix[depot_index][route[0]]

    # Add distance from the last wilaya to the depot
    total_distance += distance_matrix[route[-1]][depot_index]

    return total_distance


def is_valid_solution(routes, num_wilayas):
    visited_wilayas = set()
    for route in routes:
        for wilaya in route:
            if wilaya in visited_wilayas:
                return False
            visited_wilayas.add(wilaya)
    return len(visited_wilayas) == num_wilayas


def crossover(parent1, parent2):
    n = len(parent1)
    start = random.randint(0, n - 1)
    end = random.randint(start + 1, n)
    child = [-1] * n  # Initialize child list with placeholders

    for i in range(start, end):
        child[i] = parent1[i]

    j = 0
    for i in range(n):
        if j >= n:
            break  # Stop if we've reached the end of the child list
        if parent2[i] not in child:
            while j < n and child[j] != -1:
                j += 1
            if j < n:
                child[j] = parent2[i]
                j += 1

    return child

def repair_route(route, distance_matrix):
    # Get the set of wilayas that should be visited
    all_wilayas = set(range(len(distance_matrix)))
    visited_wilayas = set(route)

    # Remove "Alger" from visited wilayas if present
    visited_wilayas.discard(len(distance_matrix) - 1)

    # Find the missing wilayas
    missing_wilayas = list(all_wilayas - visited_wilayas)

    # Randomly insert the missing wilayas into the route
    random.shuffle(missing_wilayas)
    for i in range(len(missing_wilayas)):
        insertion_index = random.randint(1, len(route) - 1)
        route.insert(insertion_index, missing_wilayas[i])

    return route


def inversion_mutation(route):

    index1, index2 = random.sample(range(len(route)), 2)
    if index1 > index2:
        index1, index2 = index2, index1
    route[index1:index2+1] = reversed(route[index1:index2+1])


def genetic_algorithm(wilayas, num_vehicles, population_size=100, num_generations=1000, mutation_rate=0.1):
    depot_name = "Alger"
    depot_coordinates = (36.73560323832883, 3.091282328554248)
    depot_found = any(wilaya["name"] == depot_name for wilaya in wilayas)

    if not depot_found:
        # Append "Alger" to wilayas list
        depot_wilaya = {
            "name": depot_name,
            "wilayanumber": len(wilayas),
            "lat": depot_coordinates[0],
            "long": depot_coordinates[1],
            "deliveryFees": "DEPOT",
        }
        wilayas.append(depot_wilaya)

    depot_index = wilayas.index(
        next(w for w in wilayas if w["name"] == depot_name))
    distance_matrix = create_distance_matrix(wilayas)
    wilaya_indices = list(range(len(wilayas) - 1))

    # Generate initial population
    population = []
    for _ in range(population_size):
        route = random.sample(wilaya_indices, len(wilaya_indices))
        route.insert(0, depot_index)
        route.append(depot_index)
        population.append(route)

    for generation in range(num_generations):
        # Select the best individuals for the next generation
        population = sorted(
            population, key=lambda route: calculate_total_distance(route, distance_matrix, depot_index))
        selected_population = population[:population_size // 2]

        # Create offspring through crossover and mutation
        offspring_population = []
        for i in range(population_size // 2):
            parent1, parent2 = random.sample(selected_population, 2)
            child = crossover(parent1, parent2)
            if random.random() < mutation_rate:
                inversion_mutation(child)
            offspring_population.append(child)

        # Combine selected individuals and offspring for the next generation
        population = selected_population + offspring_population

    # Select the best individual as the final solution
    best_route = min(population, key=lambda route: calculate_total_distance(
        route, distance_matrix, depot_index))
    # Add starting/ending wilaya (Algiers) to the route
    best_route = [depot_index] + best_route + [depot_index]

    # Repair the route to ensure all wilayas are visited
    best_route = repair_route(best_route,
                              distance_matrix)

    # Divide the best route into vehicle routes
    routes = [best_route[i:i + len(best_route) // num_vehicles]
              for i in range(0, len(best_route), len(best_route) // num_vehicles)]

    # Format the routes for each vehicle
    vehicle_routes = []
    for i, route in enumerate(routes):
        vehicle_route = [wilayas[wilaya_index]["name"]
                         for wilaya_index in route]
        vehicle_routes.append(vehicle_route)

    return vehicle_routes


def format_routes(routes, wilaya_name_to_info):
    formatted_routes = []
    assigned_wilayas = set()

    for route in routes:
        formatted_route = []
        for wilaya_name in route:
            wilaya_info = wilaya_name_to_info[wilaya_name]
            if wilaya_name not in assigned_wilayas:
                formatted_route.append(wilaya_info)
                assigned_wilayas.add(wilaya_name)
        formatted_routes.append(formatted_route)

    return formatted_routes


if __name__ == "__main__":
    args = sys.argv[1:]
    wilayasData = json.loads(args[1])
    num_vehicles = int(args[0])
    
    depot_name = "Alger"
    depot_coordinates = (36.73560323832883, 3.091282328554248)

    wilaya_indices = list(range(len(wilayasData)))

    # Create a dictionary for the depot
    depot_wilaya = {
        "name": depot_name,
        "wilayanumber": 16,
        "lat": depot_coordinates[0],
        "long": depot_coordinates[1],
        "deliveryFees": "DEPOT",
    }

    # Check if "Alger" is present in wilayas
    depot_found = any(wilaya["name"] == depot_name for wilaya in wilayasData)

    if not depot_found:
        wilayasData.append(depot_wilaya)

    wilaya_name_to_info = {wilaya["name"]: wilaya for wilaya in wilayasData}

    result = genetic_algorithm(wilayasData, num_vehicles)

    if result:
        if len(result) > num_vehicles:
            result = result[:num_vehicles]
        formatted_routes = format_routes(result, wilaya_name_to_info)


        for i, route in enumerate(formatted_routes):
            print("--route--")

            if (i == 0):
                pass
            else:
                print(
                f"{depot_name}+{depot_coordinates[0]}+{depot_coordinates[1]}+16")
                print("==")

            
            
            for wilaya in route:
                print(
                    f"{wilaya['name']}+{wilaya['lat']}+{wilaya['long']}+{wilaya['wilayanumber']}")
                print("==")
            print(
                f"{depot_name}+{depot_coordinates[0]}+{depot_coordinates[1]}+16")
            
            
    else:
        print("No feasible solution found.")



    
 