<script setup lang="ts">
import { EditorContent, Editor } from '@tiptap/vue-3'
import { Icon } from '@iconify/vue'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { toast } from 'vue-sonner'

import FontSizePicker from '@desktop/pages/editor/components/FontSizePicker.vue'
import TextColorPicker from '@desktop/pages/editor/components/TextColorPicker.vue'
import SetLinkDialog from '@desktop/pages/editor/components/SetLinkDialog.vue'
import { setLinkConfirm } from '@desktop/pages/editor/utils/setLinkConfirm'

const model = defineModel<string>({ required: true })

const ExtTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.fontSize) return {}
          return { style: `font-size: ${attributes.fontSize}` }
        },
      },
      color: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.color,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.color) return {}
          return { style: `color: ${attributes.color}` }
        },
      },
    }
  },
})

const editor = new Editor({
  content: model.value || '',
  extensions: [
    StarterKit,
    Underline,
    ExtTextStyle,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: '请输入公告内容...' }),
    Link.configure({ openOnClick: false }),
  ],
  editorProps: {
    attributes: {
      class: 'outline-none min-h-full',
    },
  },
  onUpdate: () => {
    model.value = editor.getHTML()
  },
}) as any

watch(
  () => model.value,
  (val) => {
    if (editor.getHTML() !== val) {
      editor.commands.setContent(val || '', false)
    }
  }
)

onBeforeUnmount(() => editor.destroy())

async function handleAddLink() {
  const { from, to } = editor.state.selection
  if (from === to) {
    toast.warning('请选择需要设置超链接的文本')
    return
  }

  const url = await setLinkConfirm({})

  if (!url) return

  editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}
</script>

<template>
  <div class="border rounded-lg overflow-hidden h-[400px] flex flex-col">
    <!-- 工具栏 -->
    <div class="flex items-center flex-wrap p-2 border-b bg-muted/30 shrink-0">
      <div class="space-x-0.5">
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          @click="editor.chain().focus().undo().run()"
        >
          <Icon icon="lucide:undo" class="size-5" />
          <div class="x-tooltip-text top120">撤销</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          @click="editor.chain().focus().redo().run()"
        >
          <Icon icon="lucide:redo" class="size-5" />
          <div class="x-tooltip-text top120">重做</div>
        </button>
      </div>

      <hr class="h-5 w-px mx-2 bg-border" />

      <div class="space-x-0.5">
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('bold') }"
          @click="editor.chain().focus().toggleBold().run()"
        >
          <Icon icon="lucide:bold" class="size-5" />
          <div class="x-tooltip-text top120">加粗</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('italic') }"
          @click="editor.chain().focus().toggleItalic().run()"
        >
          <Icon icon="lucide:italic" class="size-5" />
          <div class="x-tooltip-text top120">斜体</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('underline') }"
          @click="editor.chain().focus().toggleUnderline().run()"
        >
          <Icon icon="lucide:underline" class="size-5" />
          <div class="x-tooltip-text top120">下划线</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('strike') }"
          @click="editor.chain().focus().toggleStrike().run()"
        >
          <Icon icon="lucide:strikethrough" class="size-5" />
          <div class="x-tooltip-text top120">删除线</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('codeBlock') }"
          @click="editor.chain().focus().toggleCodeBlock().run()"
        >
          <Icon icon="lucide:code" class="size-5" />
          <div class="x-tooltip-text top120">代码块</div>
        </button>
      </div>

      <hr class="h-5 w-px mx-2 bg-border" />

      <div class="space-x-0.5">
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('heading', { level: 1 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        >
          <Icon icon="lucide:heading-1" class="size-5" />
          <div class="x-tooltip-text top120">标题1</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('heading', { level: 2 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        >
          <Icon icon="lucide:heading-2" class="size-5" />
          <div class="x-tooltip-text top120">标题2</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('heading', { level: 3 }) }"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        >
          <Icon icon="lucide:heading-3" class="size-5" />
          <div class="x-tooltip-text top120">标题3</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          @click="editor.chain().focus().unsetAllMarks().run()"
        >
          <Icon icon="lucide:eraser" class="size-5" />
          <div class="x-tooltip-text top120">清除格式</div>
        </button>
      </div>

      <hr class="h-5 w-px mx-2 bg-border" />

      <div class="space-x-0.5">
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('bulletList') }"
          @click="editor.chain().focus().toggleBulletList().run()"
        >
          <Icon icon="lucide:list" class="size-5" />
          <div class="x-tooltip-text top120">无序列表</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('orderedList') }"
          @click="editor.chain().focus().toggleOrderedList().run()"
        >
          <Icon icon="lucide:list-ordered" class="size-5" />
          <div class="x-tooltip-text top120">有序列表</div>
        </button>
      </div>

      <hr class="h-5 w-px mx-2 bg-border" />

      <div class="space-x-0.5">
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive({ textAlign: 'left' }) }"
          @click="editor.chain().focus().setTextAlign('left').run()"
        >
          <Icon icon="lucide:align-left" class="size-5" />
          <div class="x-tooltip-text top120">左对齐</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive({ textAlign: 'center' }) }"
          @click="editor.chain().focus().setTextAlign('center').run()"
        >
          <Icon icon="lucide:align-center" class="size-5" />
          <div class="x-tooltip-text top120">居中对齐</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive({ textAlign: 'right' }) }"
          @click="editor.chain().focus().setTextAlign('right').run()"
        >
          <Icon icon="lucide:align-right" class="size-5" />
          <div class="x-tooltip-text top120">右对齐</div>
        </button>
      </div>

      <hr class="h-5 w-px mx-2 bg-border" />

      <div class="space-x-0.5">
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('blockquote') }"
          @click="editor.chain().focus().toggleBlockquote().run()"
        >
          <Icon icon="lucide:quote" class="size-5" />
          <div class="x-tooltip-text top120">引用</div>
        </button>
        <button
          class="x-tooltip hover:bg-muted rounded p-1.5"
          :class="{ 'bg-muted': editor.isActive('link') }"
          @click="handleAddLink"
        >
          <Icon icon="lucide:link" class="size-5" />
          <div class="x-tooltip-text top120">超链接</div>
        </button>
        <FontSizePicker :editor="editor" />
        <TextColorPicker :editor="editor" />
      </div>
    </div>

    <!-- 编辑区 -->
    <EditorContent :editor="editor" class="p-3 flex-1 overflow-y-auto" />

    <SetLinkDialog />
  </div>
</template>
