import { StyleSheet, Text, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS // kør kode på javascript tråden, i stedet for GUI tråden
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useState } from 'react';


export default function App() {
  const [images, setImages] = useState([
    { id: '1', imageUrl: require('./assets/1.png') },
    { id: '2', imageUrl: require('./assets/2.png') },
    { id: '3', imageUrl: require('./assets/3.png') }
    
  ])


  function handleSwipeOff(cardId) {
    setImages(prevCards => prevCards.filter(card => card.id !== cardId))
  }

  function rearrangeImages(cardId, direction) {
    setImages(prevImages => {
      const index = prevImages.findIndex(card => card.id === cardId);
      if (index === -1) return prevImages;

      let newImages = [...prevImages];
      if (direction === 'up' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      }
      return newImages;
    });
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {images.map((image) => (
        <MyCard key={image.id} image={image.imageUrl} onSwipeOff={() => handleSwipeOff(image.id)} id={image.id} rearrangeImages={rearrangeImages} />
      ))}
    </GestureHandlerRootView>
  );
}


const MyCard = ({ image, onSwipeOff, id, rearrangeImages }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotate.value = (translateX.value / 250) * -10;
    })
    .onEnd(() => {
      if (Math.abs(translateX.value) > 150) {
        translateX.value = withSpring(500 * Math.sign(translateX.value));
        runOnJS(onSwipeOff)();
      } else if (Math.abs(translateY.value) > 100) {
        runOnJS(rearrangeImages)(id, translateY.value < 0 ? 'up' : 'down');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        rotate.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[animatedStyle, styles.container]}>
        <Image source={image} style={styles.imgStyle} />
      </Animated.View>
    </GestureDetector>
  )
}

const styles = StyleSheet.create({
  imgStyle: {
    width: 200,
    height: 200
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
});