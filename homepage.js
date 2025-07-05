const slides = document.querySelectorAll('.testimonial-slide');
const dots = document.querySelectorAll('#testimonial-dots .dot');
let current = 0;
setInterval(() => {
  slides[current].style.display = 'none';
  dots[current].classList.remove('bg-green-400');
  dots[current].classList.add('bg-gray-700');
  current = (current + 1) % slides.length;
  slides[current].style.display = 'block';
  dots[current].classList.remove('bg-gray-700');
  dots[current].classList.add('bg-green-400');
}, 10000);
