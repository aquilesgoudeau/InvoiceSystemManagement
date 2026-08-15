import React from "react"
import { View, Image } from "react-native"
import ism from "../../../assets/ism.png"

const LandingLogo = () => {
  return (
    <View className="items-center justify-center">
      <Image
        source={ism}
        style={{ width: 250, height: 250 }}
        resizeMode="contain"
      />
    </View>
  )
}

export default LandingLogo