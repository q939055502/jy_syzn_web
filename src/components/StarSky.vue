<template>
  <div class="container">
    <div v-for="(star, index) in stars" :key="'star-' + index" :style="star.style" class="star"></div>
    <div v-for="(meteor, index) in meteors" :key="'meteor-' + index" :style="meteor.style" class="meteor"></div>
    <div v-for="(planet, index) in planets" :key="'planet-' + index" :style="planet.style" class="planet"></div>
  </div>
</template>

<script>
export default {
  data() {
    // 根据设备宽度调整星星数量，移动设备上减少星星数量以提高性能
    const width = window.innerWidth;
    let isMobile = width < 768;
    let isTablet = width >= 768 && width < 1024;
    return {
      stars: [],
      meteors: [],
      planets: [],
      minStars: isMobile ? 50 : isTablet ? 200 : 500,
      maxStars: isMobile ? 100 : isTablet ? 300 : 600,
      minMeteors: isMobile ? 1 : isTablet ? 2 : 3,
      maxMeteors: isMobile ? 2 : isTablet ? 3 : 5,
      probability: [0.7, 0.65, 0.5, 0.35, 0.3],
      lastMeteorPosition: null
    };
  },
  mounted() {
    this.generateStars();
    this.generateMeteors();
    // 添加窗口大小变化监听，动态调整星星数量
    window.addEventListener('resize', this.handleResize);
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      // 当窗口大小变化时，重新生成星星
      this.stars = [];
      this.meteors = [];
      this.planets = [];
      this.$data.minStars = window.innerWidth < 768 ? 50 : window.innerWidth < 1024 ? 200 : 500;
      this.$data.maxStars = window.innerWidth < 768 ? 100 : window.innerWidth < 1024 ? 300 : 600;
      this.$data.minMeteors = window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;
      this.$data.maxMeteors = window.innerWidth < 768 ? 2 : window.innerWidth < 1024 ? 3 : 5;
      this.generateStars();
      this.generateMeteors();
    },
    generateStars() {
      const numStars = Math.floor(Math.random() * (this.maxStars - this.minStars + 1)) + this.minStars;
      for (let i = 0; i < numStars; i++) {
        const star = {
          style: {
            top: Math.floor(Math.random() * 100) + "%",
            left: Math.floor(Math.random() * 100) + "%",
            width: Math.floor(Math.random() * 3) + "px",
            height: Math.floor(Math.random() * 3) + "px",
            backgroundColor: this.getRandomColor(),
            zIndex: 1,
          },
          duration: Math.floor(Math.random() * 1000) + 1,
          startTime: Date.now(),
        };
        this.stars.push(star);
        setInterval(() => {
          this.removeStar(star);
        }, star.duration * 1000);
      }
    },
    removeStar(star) {
      const index = this.stars.indexOf(star);
      if (index > -1) {
        this.stars.splice(index, 1);
        setTimeout(() => {
          this.generateStar(star);
        }, 1000);
      }
    },
    generateStar(star) {
      star.style.top = Math.floor(Math.random() * 100) + "%";
      star.style.left = Math.floor(Math.random() * 100) + "%";
      star.duration = Math.floor(Math.random() * 1000) + 1;
      star.startTime = Date.now();
      this.stars.push(star);
      setInterval(() => {
        this.removeStar(star);
      }, star.duration * 1000);
    },
    getRandomNumMeteors() {
      const randomNum = Math.random();
      let probabilitySum = 0;
      for (let i = 0; i < this.probability.length; i++) {
        probabilitySum += this.probability[i];
        if (randomNum <= probabilitySum) {
          return i + 1;
        }
      }
      return this.probability.length;
    },
    generateMeteors() {
      const numMeteors = this.getRandomNumMeteors();
      for (let i = 0; i < numMeteors; i++) {
        this.addMeteor();
      }
    },
    addMeteor() {
      const meteor = {
        style: {
          top: `${Math.floor(Math.random() * 100)}%`,
          left: `${Math.floor(Math.random() * 100)}%`
        },
        duration: Math.floor(Math.random() * 10) + 10,
        startTime: Date.now()
      };
      if (this.lastMeteorPosition !== null) {
        let tries = 0;
        while (this.isSamePosition(meteor.style, this.lastMeteorPosition) && tries < 10) {
          meteor.style.top = `${Math.floor(Math.random() * 100)}%`;
          meteor.style.left = `${Math.floor(Math.random() * 100)}%`;
          tries++;
        }
        if (this.meteors.length >= 10) {
          this.removeMeteor(this.meteors[0]);
          this.removeMeteor(this.meteors[1]);
        }
      }
      this.lastMeteorPosition = meteor.style;
      this.meteors.push(meteor);
      setTimeout(() => {
        this.removeMeteor(meteor);
      }, meteor.duration * 1000);
    },
    removeMeteor(meteor) {
      const index = this.meteors.indexOf(meteor);
      if (index > -1) {
        this.meteors.splice(index, 1);
        setTimeout(() => {
          this.addMeteor();
        }, 1000);
        if (this.meteors.length < this.maxMeteors) {
          this.addMeteor();
        }
      }
    },
    isSamePosition(pos1, pos2) {
      return pos1.top === pos2.top && pos1.left === pos2.left;
    },
    generatePlanets() {
      const numPlanets = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < numPlanets; i++) {
        const planet = {
          style: {
            top: Math.floor(Math.random() * 100) + "%",
            left: Math.floor(Math.random() * 100) + "%",
            backgroundColor: this.getRandomColor(),
          },
          duration: Math.floor(Math.random() * 2000) + 1,
          startTime: Date.now(),
        };
        this.planets.push(planet);
        setInterval(() => {
          this.removePlanet(planet);
        }, planet.duration * 1000);
      }
    },
    removePlanet(planet) {
      const index = this.planets.indexOf(planet);
      if (index > -1) {
        this.planets.splice(index, 1);
        setTimeout(() => {
          this.generatePlanet(planet);
        }, 1000);
      }
    },
    generatePlanet(planet) {
      planet.style.top = Math.floor(Math.random() * 100) + "%";
      planet.style.left = Math.floor(Math.random() * 100) + "%";
      planet.duration = Math.floor(Math.random() * 2000) + 1;
      planet.startTime = Date.now();
      this.planets.push(planet);
      setInterval(() => {
        this.removePlanet(planet);
      }, planet.duration * 1000);
    },
    getRandomColor() {
      const colors = ["#FFFFFF", "#FFD700", "#FFA500", "#00FFFF", "#FF69B4", "#00BFFF", "#FF1493", "#7FFF00"];
      return colors[Math.floor(Math.random() * colors.length)];
    },
  },
};
</script>

<style scoped>
.container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #000;
}

.star {
  position: absolute;
  border-radius: 50%;
  animation: twinkling 1s infinite;
}

.meteor {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #FFF;
  animation: meteor 2s ease-in-out infinite;
}

.planet {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #FFF;
  animation: planet 2s infinite;
}

@keyframes twinkling {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 更新流星动画支持全屏 */
@keyframes meteor {
  0% {
    transform: translateX(0) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateX(calc(-100vw - 100%)) translateY(calc(100vh + 100%));
    opacity: 0;
  }
}

@keyframes planet {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}
</style>