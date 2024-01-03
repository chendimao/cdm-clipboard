!include nsDialogs.nsh
XPStyle on
# 此卸载脚本在原有基础上添加指定义卸载页面 用于显示提示用户删除用户数据
Var /GLOBAL Dialog_1
; Var /GLOBAL HLine
Var /GLOBAL VLine
; Var /GLOBAL Text_1
Var /GLOBAL Label_1
Var /GLOBAL Label_2
Var /GLOBAL CheckBox_1
Var /GLOBAL Checkbox_State
# 创建自定义卸载页面
UninstPage custom un.nsDialogsPage un.nsDialogsPageLeave
Function un.nsDialogsPage
    nsDialogs::Create 1018
    Pop $Dialog_1
    ${If} $Dialog_1 == error
        Abort
    ${EndIf}
    ${NSD_CreateVLine} 0 30u 100% 12u ""
    Pop $VLine
    ${NSD_CreateLabel} 0 10u 100% 12u "卸载提示：是否删除本地存储数据？"
    Pop $Label_1
    ${NSD_CreateLabel} 10u 30u 100% 12u "保留本地存储数据可在重新安装后找回以往存储数据"
    Pop $Label_2
    ${NSD_CreateCheckbox} 0 50u 100% 10u "&确认删除本地存储数据"
    Pop $CheckBox_1
    nsDialogs::Show
FunctionEnd

Function un.nsDialogsPageLeave
     ${NSD_GetState} $CheckBox_1 $Checkbox_State
FunctionEnd

Section
SectionEnd

!macro customUnInstall
; 卸载过程执行
    ${ifNot} ${isUpdated}
    	# 判断选择结果
       ${If} $Checkbox_State == 1
        SetShellVarContext current
        MessageBox MB_OK "You checked:$\n$\n   CheckBox_1 $CheckBox_1 $\n$\n  Checkbox_State $Checkbox_State   $\n$\n  BST_CHECKED $EXEDIR $APPDATA $LOCALAPPDATA $EXEPATH $\n$\n BST_UNCHECKED ${BST_UNCHECKED}"  #MessageBox用于调试
        # delete Documents database directory
        RMDir /r "$APPDATA\cdm-clipboard\data"
       ${EndIf}
    ${endIf}
!macroend
