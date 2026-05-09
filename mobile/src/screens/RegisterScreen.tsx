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
import { registerUser } from '../services/auth';
import { FONT_SIZE } from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (submitting) return;

    if (!username.trim() || !fullName.trim() || !phone.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Дутуу мэдээлэл', 'Бүх талбарыг бөглөнө үү.');
      return;
    }

    const normalizedPhone = phone.replace(/\D/g, '');
    if (!/^\d{8,15}$/.test(normalizedPhone)) {
      Alert.alert('Утасны дугаар буруу', 'Утасны дугаарыг зөвхөн тоогоор 8-15 оронтой оруулна уу.');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Сул нууц үг', 'Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Нууц үг зөрсөн', 'Нууц үг болон баталгаажуулалт таарахгүй байна.');
      return;
    }

    setSubmitting(true);
    try {
      await registerUser(username, fullName, normalizedPhone, email, password);
      Alert.alert('Бүртгэл үүслээ', 'Та одоо энэ бүртгэлээрээ нэвтрэх боломжтой.');
      navigation.replace('Login');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу.';
      Alert.alert('Бүртгүүлэхэд алдаа гарлаа', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.background}>
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
            <View style={styles.logoBlock}>
              <View style={styles.logoBox}>
                <MaterialCommunityIcons name="account-plus-outline" size={50} color="#B9F0BD" />
              </View>
              <Text style={styles.pageTitle}>Бүртгэл үүсгэх</Text>
              <Text style={styles.subtitle}>Шинэ хэрэглэгч бүртгэх</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Бүртгүүлэх</Text>

              <Text style={styles.inputLabel}>Хэрэглэгчийн нэр</Text>
              <View style={styles.inputWrap}>
                <Feather color="#374535" name="user" size={20} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setUsername}
                  placeholder="хэрэглэгчийн_нэр"
                  placeholderTextColor="#6E7686"
                  style={styles.input}
                  value={username}
                />
              </View>

              <Text style={styles.inputLabel}>Овог нэр</Text>
              <View style={styles.inputWrap}>
                <Feather color="#374535" name="user-check" size={20} />
                <TextInput
                  autoCorrect={false}
                  onChangeText={setFullName}
                  placeholder="Жишээ: Батын Дорж"
                  placeholderTextColor="#6E7686"
                  style={styles.input}
                  value={fullName}
                />
              </View>

              <Text style={styles.inputLabel}>Утасны дугаар</Text>
              <View style={styles.inputWrap}>
                <Feather color="#374535" name="phone" size={20} />
                <TextInput
                  keyboardType="phone-pad"
                  onChangeText={(value) => setPhone(value.replace(/\D/g, ''))}
                  placeholder="99112233"
                  placeholderTextColor="#6E7686"
                  style={styles.input}
                  value={phone}
                />
              </View>
              <Text style={styles.inputLabel}>Имэйл</Text>
              <View style={styles.inputWrap}>
                <Feather color="#374535" name="mail" size={20} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  placeholder="жишээ: ner@example.mn"
                  placeholderTextColor="#6E7686"
                  style={styles.input}
                  value={email}
                />
              </View>

              <Text style={styles.inputLabel}>Нууц үг</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons color="#374535" name="lock-outline" size={22} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setPassword}
                  placeholder="********"
                  placeholderTextColor="#6E7686"
                  secureTextEntry
                  style={styles.input}
                  value={password}
                />
              </View>

              <Text style={styles.inputLabel}>Нууц үг давтах</Text>
              <View style={styles.inputWrap}>
                <MaterialCommunityIcons color="#374535" name="lock-check-outline" size={22} />
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setConfirmPassword}
                  placeholder="********"
                  placeholderTextColor="#6E7686"
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                />
              </View>

              <Pressable style={styles.primaryButton} onPress={handleRegister} disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="#EAF8EC" />
                ) : (
                  <>
                    <Feather color="#EAF8EC" name="user-plus" size={20} />
                    <Text style={styles.primaryButtonText}>Бүртгүүлэх</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.secondaryButton, submitting ? styles.secondaryDisabled : null]}
                onPress={() => navigation.replace('Login')}
                disabled={submitting}
              >
                <Text style={styles.secondaryButtonText}>Нэвтрэх хуудас руу</Text>
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
    backgroundColor: '#F0F1EF',
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  background: {
    backgroundColor: '#F0F1EF',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  logoBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBox: {
    alignItems: 'center',
    backgroundColor: '#218533',
    borderRadius: 14,
    height: 72,
    justifyContent: 'center',
    marginBottom: 20,
    width: 72,
  },
  pageTitle: {
    color: '#046B1D',
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  subtitle: {
    color: '#303931',
    fontSize: FONT_SIZE.label,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#F1F2F0',
    borderColor: '#B5C7B1',
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 28,
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  cardTitle: {
    color: '#111316',
    fontSize: FONT_SIZE.title,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputLabel: {
    color: '#39453F',
    fontSize: FONT_SIZE.label,
    fontWeight: '500',
    marginBottom: 10,
  },
  inputWrap: {
    alignItems: 'center',
    borderColor: '#B2C2AE',
    borderRadius: 10,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  input: {
    color: '#1B1D1E',
    flex: 1,
    fontSize: FONT_SIZE.body,
    paddingVertical: 10,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#006C1A',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 54,
  },
  primaryButtonText: {
    color: '#EAF8EC',
    fontSize: FONT_SIZE.button,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#B2C2AE',
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 50,
  },
  secondaryDisabled: {
    opacity: 0.7,
  },
  secondaryButtonText: {
    color: '#1B1D1E',
    fontSize: FONT_SIZE.button,
    fontWeight: '600',
  },
});
