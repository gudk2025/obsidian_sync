import { App, Notice, Plugin, PluginSettingTab, Setting, Modal, MarkdownView } from 'obsidian';
import { exec } from 'child_process';
import { promisify } from 'util';

// 封装 exec 为 Promise 形式，支持 async/await
const execAsync = promisify(exec);

// 插件核心类
export default class SyncNotePlugin extends Plugin {
  vaultPath: string; // 存储vault根目录路径

  async onload() {
    // 获取vault根目录路径
    this.vaultPath = this.app.vault.adapter.getBasePath();

    // 2. 添加侧边栏图标按钮（上传/下载）
    this.addRibbonIcon("refresh-cw", "下载笔记", async () => {
      await this.downloadNotes();
    });
    this.addRibbonIcon("cloud-upload", "上传笔记", async () => {
      await this.uploadNotes();
    });

    // 3. 可选：添加状态栏文本（可删除）
    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText("Git笔记同步插件已加载");

    // 4. 注册命令面板命令（核心：上传/下载）
    this.addCommand({
      id: "git-download-notes",
      name: "下载笔记",
      callback: async () => await this.downloadNotes()
    });
    this.addCommand({
      id: "git-upload-notes",
      name: "上传笔记",
      callback: async () => await this.uploadNotes()
    }); 
  }

  onunload() {
    console.log("Git笔记同步插件已卸载");
  }

  /**
   * 下载笔记：执行 git pull
   */
  async downloadNotes() {
    try {
      new Notice('开始下载笔记...');
      // 在vault目录执行git pull
      const { stdout, stderr } = await execAsync('git pull', { cwd: this.vaultPath });
      new Notice(stdout + stderr);
    } catch (err: any) {
      var output2 = err.message + err.stdout + err.stderr
      new Notice(`上传失败：${output2}`);
	}
  }

  /**
   * 上传笔记：执行 git commit + git push
   */
  async uploadNotes() {
    try {
      new Notice('开始上传笔记...');
      // 执行git commit
      const commitCmd = `git commit -am "上传笔记 ${this.vaultPath}"`;
	  var output = ""
	  const res1 = await execAsync("git add .", { cwd: this.vaultPath });
      output += (res1.stdout + res1.stderr)
      const res2  = await execAsync(commitCmd, { cwd: this.vaultPath });
	  output += (res2.stdout + res2.stderr)
      // 执行git push
      const res3 = await execAsync('git push', { cwd: this.vaultPath });
	  output += (res3.stdout + res3.stderr)
      new Notice(output);
    } catch (err: any) {
	  var output2 = err.message + err.stdout + err.stderr
      new Notice(`上传失败：${output2}`);
    }
  }
 
}