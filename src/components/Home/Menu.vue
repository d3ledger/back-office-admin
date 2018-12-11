<template>
  <div @mouseenter.passive="isCollapsed = false" @mouseleave.passive="isCollapsed = true">
    <el-menu
      :router="true"
      :class="'el-side-menu el-menu--collapse'"
      text-color="#a2a2a2"
      background-color="#1e1e1e"
      active-text-color="#000"
      >
      <h1 class="logo">
        <img src="@/assets/logo-small.svg" alt="D3"/>
      </h1>
      <el-menu-item class="bottom-icon" index="/logout" @click="onLogout">
        <SvgIcon iconName="Logout" iconClass="menu-icon"><LogoutIcon/></SvgIcon>
        <span slot="title">Logout</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import SvgIcon from '@/components/common/SvgIcon'
import LogoutIcon from '@/assets/menu/logout'

export default {
  name: 'Menu',
  props: {
    quorum: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      isCollapsed: true
    }
  },
  components: {
    SvgIcon,
    LogoutIcon
  },
  methods: {
    ...mapActions([
      'logout'
    ]),
    onLogout () {
      this.logout()
        .then(() => this.$router.push('/login'))
    }
  }
}
</script>

<style scoped>
.logo {
  height: 62px;
  background-color: #e43c34;
  margin-bottom: 100px;
}
.logo img {
  height: 62px;
  width: 62px;
}
.el-menu-item {
  font-family: 'IBM Plex Sans', sans-serif;
}
.el-side-menu {
  height: 100vh;
  overflow-y: auto;
  transition: width .3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-right: none;
  z-index: 100;
  width: 62px;
  /* Getting rid of element.ui styles */
  position: fixed !important;
  border-right: none !important;
}
.el-side-menu:not(.el-menu--collapse) {
  width: 160px;
}
.el-side-menu > .el-menu-item.is-active{
  background: white !important;
  color: black;
}
.el-menu-item.is-active .menu-icon {
  margin-right: 8px;
  text-align: center;
  color: #000000;
}
.menu-icon {
  margin-right: 8px;
  text-align: center;
  color: #ffffff;
}
.bottom-icon {
  position: absolute;
  bottom: 0;
  width: 100%
}
</style>
