<template>

  <div >
    <div class="flex justify-between">
      <div class="p-10px w-500px is-drag">
        设置
      </div>
      <div  class="flex justify-end">
        <div class="w-40px h-40px flex items-center hover:bg-[#eee]" @click="min" >
          <minus theme="outline" size="24" class="w-40px " fill="#333" />
        </div>
        <div class="w-40px h-40px flex items-center hover:bg-[#eee]" @click="close">
          <close-small theme="outline" size="24"  class="w-40px  " fill="#333"/>
        </div>
      </div>
    </div>

    <div class="pl-15px mytable-scrollbar  h-440px " v-if="configData">
      <a-tabs v-model:activeKey="activeKey" tab-position="left" style="height: 480px;"  >
        <a-tab-pane key="1" tab="基础设置"  >
          <div class="overflow-auto h-430px " >

<!--            <div class="flex items-center h-50px  ">-->
<!--              <div class="mr-15px line-height-35px w-120px text-right">-->
<!--                最大记录条数-->
<!--              </div>-->
<!--              <div>-->
<!--                <a-select-->
<!--                  ref="select"-->
<!--                  v-model:value="configData.maxCount"-->
<!--                  style="width: 180px"-->
<!--                >-->
<!--                  <a-select-option :value="500">500</a-select-option>-->
<!--                  <a-select-option :value="1000">1000</a-select-option>-->
<!--                  <a-select-option :value="5000">5000</a-select-option>-->
<!--                  <a-select-option :value="0">不限制</a-select-option>-->
<!--                </a-select>-->
<!--              </div>-->
<!--            </div>-->
            <div class="flex items-center h-50px  ">
              <div class="mr-15px line-height-35px w-120px text-right">
                记录过期时间
              </div>
              <div>
                <a-select
                  ref="select"
                  v-model:value="configData.expiredTime"
                  style="width: 180px"
                >
                  <a-select-option :value="3">3天后过期</a-select-option>
                  <a-select-option :value="7">7天后过期</a-select-option>
                  <a-select-option :value="30">30天后过期</a-select-option>
                  <a-select-option :value="365">365天后过期</a-select-option>
                  <a-select-option :value="0">永久保存</a-select-option>
                </a-select>
              </div>
            </div>


            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                是否缓存文件
              </div>
              <div>
                <a-select
                  ref="select"
                  v-model:value="configData.isCacheFile"
                  style="width: 180px"
                >
                  <a-select-option :value="0">云端本地双缓存</a-select-option>
                  <a-select-option :value="1">仅本地缓存</a-select-option>
                  <a-select-option :value="2">仅云端缓存</a-select-option>
                  <a-select-option :value="3">不缓存</a-select-option>
                </a-select>
              </div>
            </div>

            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                文件删除方式
              </div>
              <div>
                <a-select
                  ref="select"
                  v-model:value="configData.isDeleteFile"
                  style="width: 180px"
                >
                  <a-select-option :value="0">仅删除缓存文件</a-select-option>
                  <a-select-option :value="1">仅删除源文件</a-select-option>
                  <a-select-option :value="2">同时删除缓存和源文件</a-select-option>
                  <a-select-option :value="3">不删除</a-select-option>
                </a-select>
              </div>
            </div>

            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                显示位置
              </div>
              <div>
                <a-select
                  ref="select"
                  v-model:value="configData.isOffset"
                  style="width: 180px"
                >
                  <a-select-option :value="0">居中靠右</a-select-option>
                  <a-select-option :value="1">垂直居中</a-select-option>
<!--                  <a-select-option :value="2">相对鼠标位置</a-select-option>-->
                </a-select>
              </div>
            </div>

            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                缓存大小上限(MB)
              </div>
              <div>
                <a-input-number v-model:value="configData.fileSize"  style="width: 180px;" />
              </div>
            </div>



            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                开启Webdav同步
              </div>
              <div>
                <a-switch v-model:checked="configData.isWebdav" :checkedValue="1" :unCheckedValue="0" />
              </div>
              <div class="text-11px mt-3px ml-5px line-height-20px color-[gray]">配置后会同步数据到Webdav</div>
            </div>


            <div v-if="configData.isWebdav">

              <div class="flex items-center h-50px">
                <div class="mr-15px line-height-35px w-120px text-right">
                  Webdav地址
                </div>
                <div>
                  <a-input v-model:value="configData.webdavUrl"  style="width: 180px;" />
                </div>
              </div>

              <div class="flex items-center h-50px">
                <div class="mr-15px line-height-35px w-120px text-right">
                  用户名
                </div>
                <div>
                  <a-input v-model:value="configData.webdavUser"  style="width: 180px;" />
                </div>
              </div>
              <div class="flex items-center h-50px">
                <div class="mr-15px line-height-35px w-120px text-right">
                  密码
                </div>
                <div>
                  <a-input type="password" v-model:value="configData.webdavPass"  style="width: 180px;" />
                </div>
              </div>
              <div class="flex items-center h-50px">
                <div class="mr-15px line-height-35px w-120px text-right">

                </div>
                <div>
                  <a-button class="w-180px" @click="handleTestWebdav">测试</a-button>
                </div>
              </div>

            </div>


            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                长文本转为TXT
              </div>
              <div>
                <a-switch v-model:checked="configData.bigTextToFile" :checkedValue="1" :unCheckedValue="0" />
              </div>
              <div class="text-11px mt-3px ml-5px line-height-20px color-[gray]">复制长文本自动保存为TXT文件</div>
            </div>

            <div v-if="configData.bigTextToFile">
              <div class="flex items-center h-50px">
                <div class="mr-15px line-height-35px w-120px text-right">
                  长文本大小(KB)
                </div>
                <div>
                  <a-input-number v-model:value="configData.textSize"  style="width: 180px;" />
                </div>
              </div>
            </div>


            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                精简模式
              </div>
              <div>
                <a-switch :disabled="true" v-model:checked="configData.isMini" :checkedValue="1" :unCheckedValue="0" />
              </div>
              <div class="text-11px mt-3px ml-5px line-height-20px color-[gray]">开启后将关闭预览窗口</div>
            </div>

<!--            <div class="flex items-center h-50px">-->
<!--              <div class="mr-15px line-height-35px w-120px text-right">-->
<!--                开启通知-->
<!--              </div>-->
<!--              <div>-->
<!--                <a-switch v-model:checked="configData.isNotice" :checkedValue="1" :unCheckedValue="0" />-->
<!--              </div>-->
<!--              <div class="text-11px mt-3px ml-5px line-height-20px color-[gray]">通知记录过程中的一些问题</div>-->
<!--            </div>-->


            <div class="flex items-center h-50px">
              <div class="mr-15px line-height-35px w-120px text-right">
                开机自启
              </div>
              <div>
                <a-switch v-model:checked="configData.autoStart" :checkedValue="1" :unCheckedValue="0" />
              </div>
              <div class="text-11px mt-3px ml-5px line-height-20px color-[gray]">开机自动启动云同步剪切板</div>
            </div>
          </div>
          <div class="h-50px flex justify-center items-center mr-20px ">
            <a-button   class="w-100px mr-10px" @click="getConfig">重置</a-button>
            <a-button type="primary" class="w-100px" @click="handleSave">保存</a-button>
          </div>
        </a-tab-pane>
        <a-tab-pane key="2" tab="快捷键设置   " force-render>
          <div class="overflow-auto h-430px " >
          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              激活方式
            </div>
            <div>
                <a-switch class="ml-5px" checked-children="双击键" un-checked-children="组合键" :checked-value="1" :un-checked-value="0" v-model:checked="configData.isDoubKey" />

            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              <span v-if="configData.isDoubKey">双击</span>
              <span  v-else>组合键</span>激活程序
            </div>
            <div>
              <a-input v-if="configData.isDoubKey" :value="configData.b1" @keydown="handleKey($event, 'b1')"  allowClear style="width:240px;" />
              <a-input v-else :value="configData.k0" @keydown="handleKey($event, 'k0')" allowClear  style="width:240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速复制第2条
            </div>
            <div>
              <a-input v-model:value="configData.k1"    @keydown="handleKey($event, 'k1')" allowClear style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速复制第3条
            </div>
            <div>
              <a-input v-model:value="configData.k2"    @keydown="handleKey($event, 'k2')" allowClear style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速复制第4条
            </div>
            <div>
              <a-input v-model:value="configData.k3"    @keydown="handleKey($event, 'k3')" allowClear  style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速复制第5条
            </div>
            <div>
              <a-input v-model:value="configData.k4"    @keydown="handleKey($event, 'k4')" allowClear  style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速复制第6条
            </div>
            <div>
              <a-input v-model:value="configData.k5"    @keydown="handleKey($event, 'k5')" allowClear  style="width: 240px;" />
            </div>
          </div>



          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速粘贴第2条
            </div>
            <div>
              <a-input v-model:value="configData.k6"    @keydown="handleKey($event, 'k6')" allowClear  style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速粘贴第3条
            </div>
            <div>
              <a-input v-model:value="configData.k7"    @keydown="handleKey($event, 'k7')" allowClear  style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速粘贴第4条
            </div>
            <div>
              <a-input v-model:value="configData.k8"    @keydown="handleKey($event, 'k8')" allowClear  style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速粘贴第5条
            </div>
            <div>
              <a-input v-model:value="configData.k9"    @keydown="handleKey($event, 'k9')"  allowClear style="width: 240px;" />
            </div>
          </div>

          <div class="flex items-center h-50px">
            <div class="mr-15px line-height-35px w-120px text-right">
              快速粘贴第6条
            </div>
            <div>
              <a-input v-model:value="configData.k10"    @keydown="handleKey($event, 'k10')" allowClear  style="width: 240px;" />
            </div>
          </div>


          </div>

          <div class="h-50px flex justify-center items-center mr-20px ">
            <a-button   class="w-100px mr-10px" @click="getConfig">重置</a-button>
            <a-button type="primary" class="w-100px" @click="handleSave">保存</a-button>
          </div>
        </a-tab-pane>
        <a-tab-pane key="3" tab="数据配置" force-render>
          <div class="overflow-auto h-430px " >

              <div class="flex items-center h-50px mt-20px">
                <div class="mr-15px line-height-35px w-60px text-right">
                  数据路径
                </div>
                <div>
                  <a-textarea :autoSize="true"   v-model:value="dataPath" :disabled="true"    style="width: 320px;" />

                </div>
              </div>
            <div class="flex items-center h-50px  ">
              <div class="mr-15px line-height-35px w-60px text-right">

              </div>
              <div class="w-100% text-right mr-30px">
                <a-button type="primary" @click="changePath" >更换文件夹</a-button>
              </div>
            </div>

            <div class="flex items-center h-50px  ">
              <div class="mr-15px line-height-35px w-80px text-right">
                同步状态
              </div>
              <div class="w-100% text-right mr-30px">
                <a-button type="primary" @click="changePath" >更换文件夹</a-button>
              </div>
            </div>


          </div>
          <div class="h-50px flex justify-center items-center mr-20px ">
            <a-button   class="w-100px mr-10px" @click="getConfig">重置</a-button>
            <a-button type="primary" class="w-100px" @click="handleSave">保存</a-button>
          </div>
        </a-tab-pane>
        <a-tab-pane key="4" tab="关于" force-render>

          <div class="flex justify-center items-center flex-col h-430px">
              <div>
                <a-image :src="logo" width="100px"/>
              </div>
              <div class="mt-10px">
                <span class="text-20px font-bold">云同步剪切板</span><span class="ml-5px color-[gray] text-15px"  >{{version}}</span>
              </div>
              <div class="p-10px color-gray">
                一款免费开源的剪切板同步软件，支持多设备同步剪切板
              </div>
            <a-divider/>

            <div class="flex justify-between w-75%">
                  <a-button type="link" class="m-5px"  @click="toLink('http://www.chendimao.com')">官网</a-button>
                  <a-button type="link" class="m-5px" @click="toLink('http://github.com/chendimao/cdm-clipboard')">Github</a-button>
                  <a-button type="link" class="m-5px" @click="toLink('http://www.chendimao.com')">反馈交流群</a-button>
<!--              <a-button type="link" class="m-5px" @click="toLink('')">用户协议</a-button>-->
            </div>

          </div>

        </a-tab-pane>
      </a-tabs>


    </div>

  </div>


</template>


<script setup lang="ts">

import {CloseSmall, Minus} from "@icon-park/vue-next";
import {createVNode, onMounted} from "vue";
import logo from '../../assets/img/icon.png';
import {message, Modal} from "ant-design-vue";

const oldConfig = ref();
const { ipcRenderer } = window.electron
const activeKey = ref('1');
const configData = ref();
const version = ref();
const dblKey = ref();
const currentKey = ref();
const dataPath  = ref('');
const oldDataPath = ref('');


onMounted(() => {
  getConfig();
  getVersion();
  getDataPath();

  ipcRenderer.on('onDblKey',  (event, arg) =>{
    console.log(arg);
    if (configData.value.isDoubKey == 1 && currentKey.value == 'b1') {

      configData.value['b1'] =  arg? arg[0].value : '';
    }


    //getData();
  })

})


function getConfig() {
  ipcRenderer.invoke('getConfig').then(res => {
    configData.value = JSON.parse(JSON.stringify(res));
    oldConfig.value = JSON.parse(JSON.stringify(res));
    message.success('获取配置成功');
  })
}

function handleSave() {
  configData.value.dataPath =  dataPath.value;
  ipcRenderer.invoke('saveConfig', JSON.stringify(configData.value)).then(res => {


    if (res?.changes === 1) {
      message.success('保存配置成功');
      ipcRenderer.invoke('handleShortcut');
      setTimeout(() => {
        ipcRenderer.invoke('handleRestart');
      }, 1000);

    }

  })
}




function handleKey(ev, key) {

  let keyStr = ''
      if (key === 'b1') {
        currentKey.value = key;
        return;
      }




    if (ev.altKey) {
      keyStr += 'Alt+';
    }
    if (ev.ctrlKey) {
      keyStr += 'CommandOrControl+';
    }
    if (ev.shiftKey) {
      keyStr += 'Shift+';
    }

    if (![16, 17, 18].includes(ev.keyCode)) {
      keyStr += ev.key.toUpperCase();
    }


    if (['Alt+', 'CommandOrControl+', 'Shift+'].includes(keyStr)) {
      configData.value[key] = '';
    } else {
      let flag = true;
        for (let i = 0; i < 16; i++) {
          if (configData.value['k' + i] == keyStr) {
            flag = false;
          }
      }

      if (flag) {
        configData.value[key] = keyStr;
      } else {

        message.info('快捷键重复，请重新设置');
      }


    }


}


function min() {
  ipcRenderer.invoke('handleMin');

}

function close() {
  ipcRenderer.invoke('handleClose');
}

function toLink(link) {
  ipcRenderer.invoke('toLink', link);
}

function getVersion() {
  ipcRenderer.invoke('getVersion').then(res => {
    version.value = res;
  })
}

function getDataPath() {
  ipcRenderer.invoke('getDataPath').then(res => {
    dataPath.value = res;
    oldDataPath.value = res;
  })
}

function changePath() {
   ipcRenderer.invoke('changeDataPath').then(res => {

     if (res.canceled === false) {
       dataPath.value = res.filePaths[0];
     }


  })

}

function handleTestWebdav() {
  if (!configData.value.webdavUrl) {
    message.info('请输入webdav地址');
    return;
  }

  if (!configData.value.webdavUser) {
    message.info('请输入webdav用户名');
    return;
  }
  if (!configData.value.webdavPass) {
    message.info('请输入webdav密码');
    return;
  }

  ipcRenderer.invoke('getWebdavFileList', configData.value.webdavUrl, configData.value.webdavUser, configData.value.webdavPass).then(res => {
   const r = JSON.parse(res);
    if (!('?xml' in r)){
      message.error('webdav连接失败，请检查webdav地址、用户名和密码');
    } else {
      console.log(r);
      message.success('webdav连接成功');
    }
  });


}

</script>
<style scoped lang="less">

</style>
