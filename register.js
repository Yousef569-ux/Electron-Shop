const NameInput = document.getElementById('Name');
const phoneInput = document.getElementById('phone');
const countryCode = document.getElementById('country-code');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
phoneInput.addEventListener('input', function(e) {
  // يشيل أي حاجة مش رقم
  this.value = this.value.replace(/\D/g, '');
  
  // لو مصر يبقى 11 رقم ويبدأ بـ 01
  if(countryCode.value === '+20') {
    if(this.value.length > 11) this.value = this.value.slice(0, 11);
    if(this.value.length >= 3) {
      const valid = ['010','011','012','015'].some(p => this.value.startsWith(p));
      this.setCustomValidity(valid ? '' : 'لازم يبدأ بـ 010/011/012/015');
    }
  }
});
document.getElementById("Signup-Form").addEventListener("submit", () => {
const UNValue = String(NameInput.value);
const phoValue = String(phoneInput.value);
const emaValue = String(emailInput.value);
const passValue = String(passwordInput.value);
localStorage.setItem("UserName", UNValue);
localStorage.setItem("PhoneNum", phoValue);
localStorage.setItem("Emailv", emaValue);
localStorage.setItem("Passwordv", passValue);
if(phoValue !== '' && emaValue !== '' && passValue !==  '' && UNValue !==  ''){
window.location.href = "index.html";
alert('Registration Successful! Please go to the Login page')
}
});
document.getElementById('LoginGo').addEventListener("click", () => {
window.location.href = "index.html";
});