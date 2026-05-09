import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../navigation/AppNavigator';
import { loginUser } from '../services/auth';
import { FONT_SIZE } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;
type AuthTab = 'login' | 'register';

export default function LoginScreen({ navigation }: Props) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  const isLoginTab = activeTab === 'login';

  const handleLogin = async () => {
    if (loading) return;

    if (!identifier.trim() || !password) {
      Alert.alert('Дутуу мэдээлэл', 'Имэйл эсвэл хэрэглэгчийн нэр, нууц үгээ оруулна уу.');
      return;
    }

    setLoading(true);
    try {
      await loginUser(identifier, password);
      navigation.replace('Home');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Нэвтрэх боломжгүй байна. Дахин оролдоно уу.';
      Alert.alert('Нэвтрэхэд алдаа гарлаа', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
        <View style={[styles.diagonal, styles.diagonalTop]} />
        <View style={[styles.diagonal, styles.diagonalBottom]} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ScrollView
            bounces={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.heroSection}>
              <View style={styles.logoBox}>
                <MaterialCommunityIcons name="bank-outline" size={56} color="#FFFFFF" />
              </View>
              <Text style={styles.heroTitle}>Иргэдийн хүсэлт, өргөдлийн систем</Text>
              <Text style={styles.heroCopyright}>© 2026 Төрийн захиргааны газар</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.tabRow}>
                <Pressable
                  onPress={() => setActiveTab('login')}
                  style={[styles.tabButton, isLoginTab ? styles.tabButtonActive : styles.tabButtonInactive]}
                >
                  <Text style={[styles.tabText, isLoginTab ? styles.tabTextActive : styles.tabTextInactive]}>
                    Нэвтрэх
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setActiveTab('register')}
                  style={[styles.tabButton, !isLoginTab ? styles.tabButtonActive : styles.tabButtonInactive]}
                >
                  <Text style={[styles.tabText, !isLoginTab ? styles.tabTextActive : styles.tabTextInactive]}>
                    Бүртгүүлэх
                  </Text>
                </Pressable>
              </View>

              {isLoginTab ? (
                <>
                  <Text style={styles.cardTitle}>Нэвтрэх</Text>

                  <Text style={styles.inputLabel}>Имэйл эсвэл хэрэглэгчийн нэр</Text>
                  <View style={styles.inputWrap}>
                    <Feather color="#4E5E52" name="user" size={20} />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={setIdentifier}
                      placeholder="жишээ: ner@example.mn"
                      placeholderTextColor="#7D8A7E"
                      style={styles.input}
                      value={identifier}
                    />
                  </View>

                  <Text style={styles.inputLabel}>Нууц үг</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons color="#4E5E52" name="lock-outline" size={22} />
                    <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      onChangeText={setPassword}
                      placeholder="********"
                      placeholderTextColor="#7D8A7E"
                      secureTextEntry
                      style={styles.input}
                      value={password}
                    />
                  </View>

                  <Pressable style={styles.forgotRow}>
                    <Text style={styles.forgotText}>Нууц үгээ мартсан уу?</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.cardTitle}>Бүртгүүлэх</Text>
                  <Text style={styles.registerHelperText}>
                    Шинэ хэрэглэгч бүртгүүлэхийн тулд доорх товчийг дарна уу.
                  </Text>
                </>
              )}

              <Pressable
                style={[styles.primaryButton, loading ? styles.disabledButton : null]}
                onPress={isLoginTab ? handleLogin : () => navigation.navigate('Register')}
                disabled={loading}
              >
                {loading && isLoginTab ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather color="#FFFFFF" name={isLoginTab ? 'log-in' : 'user-plus'} size={22} />
                    <Text style={styles.primaryButtonText}>{isLoginTab ? 'Нэвтрэх' : 'Бүртгүүлэх'}</Text>
                  </>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EEF2EE',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  background: {
    backgroundColor: '#EEF2EE',
    flex: 1,
  },
  diagonal: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    height: 180,
    position: 'absolute',
    width: 520,
  },
  diagonalTop: {
    left: -190,
    top: 0,
    transform: [{ rotate: '-40deg' }],
  },
  diagonalBottom: {
    right: -240,
    top: 600,
    transform: [{ rotate: '-40deg' }],
  },
  scrollContent: {
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: '#1a6b35',
    borderRadius: 22,
    marginBottom: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    height: 82,
    justifyContent: 'center',
    marginBottom: 16,
    width: 82,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
  heroCopyright: {
    color: '#CFE1D4',
    fontSize: 12,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#F5F8F5',
    borderColor: '#D5DED6',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
  },
  tabRow: {
    backgroundColor: '#E3EAE4',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    padding: 4,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 42,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: FONT_SIZE.label,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#1a6b35',
  },
  tabTextInactive: {
    color: '#6E7C72',
  },
  cardTitle: {
    color: '#111316',
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    color: '#2F3F34',
    fontSize: FONT_SIZE.label,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#f8f9f8',
    borderColor: '#e8ebe8',
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    minHeight: 54,
    paddingHorizontal: 12,
  },
  input: {
    color: '#1C2520',
    flex: 1,
    fontSize: FONT_SIZE.body,
    paddingVertical: 10,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    marginTop: -6,
  },
  forgotText: {
    color: '#1a6b35',
    fontSize: FONT_SIZE.label,
    fontWeight: '600',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#1a6b35',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 2,
    minHeight: 56,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.button,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerHelperText: {
    color: '#4F5B53',
    fontSize: FONT_SIZE.body,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 18,
  },
});
