using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Windows.Forms;

// Streamer.bot C# action: verify/install/update the shared RTS UI DLL.
// IMPORTANT: this action must NOT reference RtsUI.dll itself.
public class CPHInline
{
    private const string ExtensionName = "RTS Ban / Timeout Widget";
    private const string MinimumRtsUiVersion = "0.1.0";
    private const string DllName = "RtsUI.dll";
    private const string ReleaseApiUrl = "https://api.github.com/repos/DizzyBHigh/RTS-UI-Dll/releases/latest";
    private const string DownloadUrl = "https://github.com/DizzyBHigh/RTS-UI-Dll/releases/latest/download/RtsUI.dll";

    public bool Execute()
    {
        string baseDirectory = ResolveStreamerBotDirectory();
        string dllDirectory = Path.Combine(baseDirectory, "dlls");
        string dllPath = Path.Combine(dllDirectory, DllName);

        CPH.LogInfo($"[{ExtensionName}] RTS UI DLL check: {dllPath}");

        try
        {
            Directory.CreateDirectory(dllDirectory);

            Version minimumVersion = ParseVersion(MinimumRtsUiVersion);
            Version installedVersion = GetInstalledVersion(dllPath);

            if (installedVersion == null)
            {
                CPH.LogInfo($"[{ExtensionName}] RtsUI.dll is not installed.");

                DialogResult result = MessageBox.Show(
                    "The RTS UI library is required for the settings UI.\n\n" +
                    "RtsUI.dll is not installed. Download it now?",
                    ExtensionName,
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Question);

                if (result != DialogResult.Yes)
                {
                    CPH.LogInfo($"[{ExtensionName}] RtsUI.dll download declined.");
                    return false;
                }

                return DownloadAndInstall(dllPath, minimumVersion, null);
            }

            CPH.LogInfo($"[{ExtensionName}] Installed RtsUI.dll version: {installedVersion}");

            if (installedVersion < minimumVersion)
            {
                DialogResult result = MessageBox.Show(
                    $"This extension requires RtsUI.dll {minimumVersion} or newer.\n\n" +
                    $"Installed version: {installedVersion}\n\n" +
                    "Download the required version now?",
                    ExtensionName,
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Warning);

                if (result != DialogResult.Yes)
                {
                    CPH.LogInfo($"[{ExtensionName}] Required RtsUI.dll update declined.");
                    return false;
                }

                return DownloadAndInstall(dllPath, minimumVersion, null);
            }

            Version latestVersion = GetLatestReleaseVersion();
            if (latestVersion != null && installedVersion < latestVersion)
            {
                DialogResult result = MessageBox.Show(
                    $"A newer RtsUI.dll is available.\n\n" +
                    $"Installed version: {installedVersion}\n" +
                    $"Latest version: {latestVersion}\n\n" +
                    "Download and install the update now?",
                    ExtensionName,
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information);

                if (result == DialogResult.Yes)
                    return DownloadAndInstall(dllPath, minimumVersion, latestVersion);

                CPH.LogInfo($"[{ExtensionName}] Optional RtsUI.dll update declined.");
            }

            return true;
        }
        catch (Exception ex)
        {
            CPH.LogError($"[{ExtensionName}] RtsUI.dll check failed: {ex}");
            MessageBox.Show(
                "The RTS UI library could not be checked.\n\n" + ex.Message,
                ExtensionName,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);
            return false;
        }
    }

    private bool DownloadAndInstall(string dllPath, Version minimumVersion, Version expectedLatestVersion)
    {
        string tempPath = dllPath + ".download";

        try
        {
            if (File.Exists(tempPath))
                File.Delete(tempPath);

            CPH.LogInfo($"[{ExtensionName}] Downloading RtsUI.dll from latest GitHub release...");

            using (WebClient client = new WebClient())
            {
                client.Headers[HttpRequestHeader.UserAgent] = "RTS-Ban-Timeout-Widget";
                client.DownloadFile(DownloadUrl, tempPath);
            }

            Version downloadedVersion = GetInstalledVersion(tempPath);
            if (downloadedVersion == null)
                throw new InvalidDataException("The downloaded file is not a valid RtsUI.dll assembly.");

            if (downloadedVersion < minimumVersion)
                throw new InvalidDataException($"The downloaded RtsUI.dll is version {downloadedVersion}, but {minimumVersion} is required.");

            if (expectedLatestVersion != null && downloadedVersion < expectedLatestVersion)
                throw new InvalidDataException($"The downloaded RtsUI.dll is version {downloadedVersion}, but the release reported {expectedLatestVersion}.");

            File.Copy(tempPath, dllPath, true);
            File.Delete(tempPath);

            CPH.LogInfo($"[{ExtensionName}] RtsUI.dll {downloadedVersion} installed successfully.");

            return true;
        }
        catch (Exception ex)
        {
            try
            {
                if (File.Exists(tempPath))
                    File.Delete(tempPath);
            }
            catch
            {
                // Ignore cleanup failures; the original DLL is left untouched.
            }

            CPH.LogError($"[{ExtensionName}] Failed to install RtsUI.dll: {ex.Message}");

            MessageBox.Show(
                "RtsUI.dll could not be installed.\n\n" +
                ex.Message + "\n\n" +
                "The existing DLL has been left untouched.",
                ExtensionName,
                MessageBoxButtons.OK,
                MessageBoxIcon.Error);

            return false;
        }
    }

    private Version GetInstalledVersion(string path)
    {
        if (!File.Exists(path))
            return null;

        try
        {
            return AssemblyName.GetAssemblyName(path).Version;
        }
        catch
        {
            return null;
        }
    }

    private Version GetLatestReleaseVersion()
    {
        try
        {
            using (WebClient client = new WebClient())
            {
                client.Headers[HttpRequestHeader.UserAgent] = "RTS-Ban-Timeout-Widget";
                string json = client.DownloadString(ReleaseApiUrl);

                Match match = Regex.Match(json, @"\"tag_name\"\s*:\s*\"v?([0-9]+(?:\.[0-9]+){1,3})\"", RegexOptions.IgnoreCase);
                if (!match.Success)
                    return null;

                return ParseVersion(match.Groups[1].Value);
            }
        }
        catch (Exception ex)
        {
            // An unavailable GitHub API must not prevent an otherwise valid installation from running.
            CPH.LogInfo($"[{ExtensionName}] Could not check the latest RtsUI.dll release: {ex.Message}");
            return null;
        }
    }

    private static Version ParseVersion(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
            return null;

        string clean = value.Trim();
        if (clean.StartsWith("v", StringComparison.OrdinalIgnoreCase))
            clean = clean.Substring(1);

        int dash = clean.IndexOf('-');
        if (dash >= 0)
            clean = clean.Substring(0, dash);

        return new Version(clean);
    }

    private string ResolveStreamerBotDirectory()
    {
        string[] candidates =
        {
            AppDomain.CurrentDomain.BaseDirectory,
            Directory.GetCurrentDirectory(),
            Path.GetDirectoryName(Process.GetCurrentProcess().MainModule.FileName)
        };

        foreach (string candidate in candidates)
        {
            if (IsUsableStreamerBotDirectory(candidate))
                return candidate;
        }

        return Directory.GetCurrentDirectory();
    }

    private bool IsUsableStreamerBotDirectory(string path)
    {
        if (string.IsNullOrWhiteSpace(path) || !Directory.Exists(path))
            return false;

        string normalized = path.Replace('/', '\\').TrimEnd('\\');
        if (normalized.IndexOf("\\System32", StringComparison.OrdinalIgnoreCase) >= 0)
            return false;
        if (normalized.StartsWith(@"C:\Windows\SystemApps", StringComparison.OrdinalIgnoreCase))
            return false;

        return true;
    }
}
