import { createI18n } from 'vue-i18n'
import uz from './uz.json'
import ru from './ru.json'

const savedLocale = localStorage.getItem('restaurant_locale') || 'uz'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'uz',
  messages: { uz, ru },
})

export default i18n
