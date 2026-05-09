import { StatusBar } from 'expo-status-bar';
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
      <StatusBar style="dark" />
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
          <View style={styles.heroCard}>
            <View style={styles.heroIconTile}>
              <MaterialCommunityIcons name="bank-outline" size={58} color="#FFFFFF" />
            </View>
            <Text style={styles.heroTitle}>Иргэдийн хүсэлт, өргөдлийн систем</Text>
            <Text style={styles.heroCopyright}>© 2026 Төрийн захиргааны газар</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.tabTrack}>
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
                  <Feather color="#43564A" name="user" size={22} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setIdentifier}
                    placeholder="жишээ: ner@example.mn"
                    placeholderTextColor="#7A8A7E"
                    style={styles.input}
                    value={identifier}
                  />
                </View>

                <Text style={styles.inputLabel}>Нууц үг</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons color="#43564A" name="lock-outline" size={24} />
                  <TextInput
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={setPassword}
                    placeholder="********"
                    placeholderTextColor="#7A8A7E"
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
                  Шинэ хэрэглэгч бол бүртгэлийн хуудас руу орж мэдээллээ бөглөнө үү.
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
                  <Feather color="#FFFFFF" name={isLoginTab ? 'log-in' : 'user-plus'} size={24} />
                  <Text style={styles.primaryButtonText}>{isLoginTab ? 'Нэвтрэх' : 'Бүртгүүлэх'}</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#EEF2EF',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  heroCard: {
    alignItems: 'center',
    backgroundColor: '#136B36',
    borderRadius: 30,
    marginBottom: 18,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  heroIconTile: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: 20,
    height: 116,
    justifyContent: 'center',
    marginBottom: 20,
    width: 116,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 36,
    textAlign: 'center',
  },
  heroCopyright: {
    color: '#D9E9DE',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 14,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#F3F7F4',
    borderColor: '#D6DED8',
    borderRadius: 24,
    borderWidth: 1.2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#102015',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  tabTrack: {
    backgroundColor: '#DFE5E0',
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    marginBottom: 22,
    padding: 6,
  },
  tabButton: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#9AA79D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 1.5,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: FONT_SIZE.body,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#106634',
  },
  tabTextInactive: {
    color: '#6A776F',
  },
  cardTitle: {
    color: '#101512',
    fontSize: FONT_SIZE.title,
    fontWeight: '800',
    marginBottom: 18,
  },
  inputLabel: {
    color: '#26362C',
    fontSize: FONT_SIZE.button,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrap: {
    alignItems: 'center',
    backgroundColor: '#F8FAF8',
    borderColor: '#DDE4DE',
    borderRadius: 16,
    borderWidth: 1.2,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    minHeight: 62,
    paddingHorizontal: 14,
  },
  input: {
    color: '#1F2B23',
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 14,
    marginTop: 2,
  },
  forgotText: {
    color: '#106634',
    fontSize: FONT_SIZE.button,
    fontWeight: '700',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#136B36',
    borderRadius: 15,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 60,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.title,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerHelperText: {
    color: '#4A5A51',
    fontSize: FONT_SIZE.body,
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 22,
  },
});
