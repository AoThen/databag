import { View, ActivityIndicator } from 'react-native';
import { styles } from './Root.styled';
import { useRoot } from './useRoot.hook';
import { Colors } from 'constants/Colors';

export function Root() {
  const root = useRoot();
  
  if (root.state.loading) {
    return (
      <View style={styles.wrapper}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }
  
  return <View style={styles.wrapper} />
}
