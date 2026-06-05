import { StyleSheet, View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { theme } from "@/theme";
import { PlantType } from "@/store/plantsStore";
import { PlantlyImage } from "./PlantlyImage";

export function PlantCard({ plant }: { plant: PlantType }) {
  return (
    <Link href={`plants/${plant.id}`} asChild>
      <Pressable style={styles.plantCard}>
        <PlantlyImage size={100} imageUri={plant.imageUri} />
        <View style={styles.details}>
          <Text numberOfLines={1} style={styles.plantName}>
            {plant.name}
          </Text>
          <Text style={styles.subtitle}>
            Water every {plant.wateringFrequencyDays} days
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  plantCard: {
    flexDirection: "row",
    shadowColor: theme.colorBlack,
    backgroundColor: theme.colorWhite,
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,

    elevation: 3,
  },
  details: {
    padding: 14,
    justifyContent: "center",
  },
  plantName: {
    fontSize: 18,
    marginBottom: 4,
  },
  subtitle: {
    color: theme.colorGrey,
  },
});
