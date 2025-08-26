package common

import (
	"context"
	"fmt"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss"
	"github.com/aliyun/alibabacloud-oss-go-sdk-v2/oss/credentials"
)

/*
Go SDK V2 客户端初始化配置说明：

1. 签名版本：Go SDK V2 默认使用 V4 签名，提供更高的安全性
2. Region配置：初始化 Client 时，您需要指定阿里云通用 Region ID 作为发起请求地域的标识
   本示例代码使用华东2（上海）Region ID：cn-shanghai
   如需查询其它 Region ID 请参见：OSS地域和访问域名
3. Endpoint配置：
   - 可以通过 Endpoint 参数，自定义服务请求的访问域名
   - 当不指定时，SDK 默认根据 Region 信息，构造公网访问域名
   - 例如当 Region 为 'cn-shanghai' 时，构造出来的访问域名为：'https://oss-cn-shanghai.aliyuncs.com'
4. 协议配置：
   - SDK 构造访问域名时默认采用 HTTPS 协议
   - 如需采用 HTTP 协议，请在指定域名时指定为 HTTP，例如：'http://oss-cn-shanghai.aliyuncs.com'
*/

// OssUploadPicture 上传图片到阿里云OSS
// imagePath: 本地图片文件路径
// ossKey: 在OSS中的对象名称（可以包含路径，如 "images/logo.png"）
// 返回: 上传成功后的访问URL和错误信息
func OssUploadPicture(imagePath, ossKey string) (string, error) {
	// 从环境变量获取凭证
	accessKeyId := os.Getenv("OSS_ACCESS_KEY_ID")
	accessKeySecret := os.Getenv("OSS_ACCESS_KEY_SECRET")
	// 检查文件是否存在
	fileInfo, err := os.Stat(imagePath)
	if os.IsNotExist(err) {
		return "", fmt.Errorf("图片文件不存在: %s", imagePath)
	}
	if err != nil {
		return "", fmt.Errorf("无法获取文件信息: %v", err)
	}

	// 检查文件大小（限制为10MB）
	const maxFileSize = 10 * 1024 * 1024 // 10MB
	if fileInfo.Size() > maxFileSize {
		return "", fmt.Errorf("图片文件过大: %.2fMB，最大支持10MB", float64(fileInfo.Size())/(1024*1024))
	}

	// 打开文件
	file, err := os.Open(imagePath)
	if err != nil {
		return "", fmt.Errorf("无法打开图片文件: %v", err)
	}
	defer file.Close()

	// 根据文件扩展名确定Content-Type
	contentType := getImageContentType(imagePath)
	if contentType == "" {
		return "", fmt.Errorf("不支持的图片格式，仅支持 .jpg, .jpeg, .png, .gif, .webp")
	}

	// 配置OSS客户端
	cfg := oss.LoadDefaultConfig().
		WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, ""),
		).
		WithRegion("cn-shanghai")

	client := oss.NewClient(cfg)

	// 创建上传请求
	request := &oss.PutObjectRequest{
		Bucket:        oss.Ptr("qzf-bucket"),
		Key:           oss.Ptr(ossKey),
		Body:          file,
		ContentLength: oss.Ptr(fileInfo.Size()),
		ContentType:   oss.Ptr(contentType),
		// 设置缓存控制，图片通常可以缓存较长时间
		CacheControl: oss.Ptr("max-age=31536000"), // 1年
	}

	log.Printf("开始上传图片: %s -> %s", imagePath, ossKey)

	// 执行上传
	result, err := client.PutObject(context.TODO(), request)
	if err != nil {
		return "", fmt.Errorf("图片上传失败: %v", err)
	}

	// 构造访问URL
	url := fmt.Sprintf("https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/%s", ossKey)

	log.Printf("✅ 图片上传成功!")
	log.Printf("本地路径: %s", imagePath)
	log.Printf("OSS对象名: %s", ossKey)
	log.Printf("文件大小: %.2fKB", float64(fileInfo.Size())/1024)
	log.Printf("Content-Type: %s", contentType)
	if result.ETag != nil {
		log.Printf("ETag: %s", *result.ETag)
	}
	log.Printf("访问URL: %s", url)

	return url, nil
}

// getImageContentType 根据文件扩展名返回对应的Content-Type
func getImageContentType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".bmp":
		return "image/bmp"
	case ".svg":
		return "image/svg+xml"
	default:
		return ""
	}
}

// OssUploadPictureWithResize 上传图片并支持简单的重命名
// imagePath: 本地图片文件路径
// customName: 自定义文件名（不包含扩展名），如果为空则使用原文件名
// folder: OSS中的文件夹路径（可选），如 "images" 或 "uploads/2024"
func OssUploadPictureWithResize(imagePath, customName, folder string) (string, error) {
	// 获取原文件名和扩展名
	originalName := filepath.Base(imagePath)
	ext := filepath.Ext(imagePath)

	// 确定最终的文件名
	var fileName string
	if customName != "" {
		fileName = customName + ext
	} else {
		fileName = originalName
	}

	// 构造OSS对象名
	var ossKey string
	if folder != "" {
		// 清理文件夹路径，确保格式正确
		folder = strings.Trim(folder, "/")
		ossKey = folder + "/" + fileName
	} else {
		ossKey = fileName
	}

	// 调用基本上传函数
	return OssUploadPicture(imagePath, ossKey)
}

// BatchUploadPictures 批量上传图片
// imagePaths: 图片路径列表
// folder: OSS中的文件夹路径
// 返回: 成功上传的URL列表和错误信息
func BatchUploadPictures(imagePaths []string, folder string) ([]string, error) {
	var urls []string
	var errors []string

	for i, imagePath := range imagePaths {
		log.Printf("正在上传第 %d/%d 张图片: %s", i+1, len(imagePaths), imagePath)

		url, err := OssUploadPictureWithResize(imagePath, "", folder)
		if err != nil {
			errorMsg := fmt.Sprintf("上传失败 %s: %v", imagePath, err)
			errors = append(errors, errorMsg)
			log.Printf("❌ %s", errorMsg)
			continue
		}

		urls = append(urls, url)
		log.Printf("✅ 第 %d 张图片上传成功", i+1)
	}

	if len(errors) > 0 {
		return urls, fmt.Errorf("部分图片上传失败: %s", strings.Join(errors, "; "))
	}

	log.Printf("🎉 批量上传完成，共上传 %d 张图片", len(urls))
	return urls, nil
}

// OssUploadFromMultipart 从multipart.FileHeader上传图片到阿里云OSS
// fileHeader: multipart.FileHeader 文件头
// folder: OSS中的文件夹路径（可选），如 "images" 或 "uploads/2024"
// 返回: 上传成功后的访问URL和错误信息
func OssUploadFromMultipart(fileHeader *multipart.FileHeader, folder string) (string, error) {
	// 从环境变量获取凭证
	accessKeyId := os.Getenv("OSS_ACCESS_KEY_ID")
	accessKeySecret := os.Getenv("OSS_ACCESS_KEY_SECRET")
	fmt.Println(accessKeyId)
	fmt.Println(accessKeySecret)

	// 验证文件大小（限制为10MB）
	const maxFileSize = 10 * 1024 * 1024 // 10MB
	if fileHeader.Size > maxFileSize {
		return "", fmt.Errorf("图片文件过大: %.2fMB，最大支持10MB", float64(fileHeader.Size)/(1024*1024))
	}

	// 打开文件
	file, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("无法打开图片文件: %v", err)
	}
	defer file.Close()

	// 根据文件扩展名确定Content-Type
	contentType := getImageContentTypeFromFilename(fileHeader.Filename)
	if contentType == "" {
		return "", fmt.Errorf("不支持的图片格式，仅支持 .jpg, .jpeg, .png, .gif, .webp")
	}

	// 生成唯一的文件名
	ext := filepath.Ext(fileHeader.Filename)
	originalName := strings.TrimSuffix(fileHeader.Filename, ext)
	uniqueFileName := fmt.Sprintf("%s_%d%s", originalName, time.Now().Unix(), ext)

	// 构造OSS对象名
	var ossKey string
	if folder != "" {
		// 清理文件夹路径，确保格式正确
		folder = strings.Trim(folder, "/")
		ossKey = folder + "/" + uniqueFileName
	} else {
		ossKey = uniqueFileName
	}

	// 配置OSS客户端
	cfg := oss.LoadDefaultConfig().
		WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(accessKeyId, accessKeySecret, ""),
		).
		WithRegion("cn-shanghai")

	client := oss.NewClient(cfg)

	// 创建上传请求
	request := &oss.PutObjectRequest{
		Bucket:        oss.Ptr("qzf-bucket"),
		Key:           oss.Ptr(ossKey),
		Body:          file,
		ContentLength: oss.Ptr(fileHeader.Size),
		ContentType:   oss.Ptr(contentType),
		// 设置缓存控制，图片通常可以缓存较长时间
		CacheControl: oss.Ptr("max-age=31536000"), // 1年
	}

	log.Printf("开始上传图片: %s -> %s", fileHeader.Filename, ossKey)

	// 执行上传
	result, err := client.PutObject(context.TODO(), request)
	if err != nil {
		return "", fmt.Errorf("图片上传失败: %v", err)
	}

	// 构造访问URL
	url := fmt.Sprintf("https://qzf-bucket.oss-cn-shanghai.aliyuncs.com/%s", ossKey)

	log.Printf("✅ 图片上传成功!")
	log.Printf("原文件名: %s", fileHeader.Filename)
	log.Printf("OSS对象名: %s", ossKey)
	log.Printf("文件大小: %.2fKB", float64(fileHeader.Size)/1024)
	log.Printf("Content-Type: %s", contentType)
	if result.ETag != nil {
		log.Printf("ETag: %s", *result.ETag)
	}
	log.Printf("访问URL: %s", url)

	return url, nil
}

// BatchUploadFromMultipart 批量上传multipart文件到OSS
// fileHeaders: multipart.FileHeader文件头列表
// folder: OSS中的文件夹路径
// 返回: 成功上传的URL列表和错误信息
func BatchUploadFromMultipart(fileHeader *multipart.FileHeader, folder string) (string, error) {

	var errors []string

	url, err := OssUploadFromMultipart(fileHeader, folder)
	if err != nil {
		errorMsg := fmt.Sprintf("上传失败 %s: %v", fileHeader.Filename, err)
		errors = append(errors, errorMsg)
		log.Printf("❌ %s", errorMsg)

	}

	log.Printf("✅ 图片上传成功")

	if len(errors) > 0 {
		return "", fmt.Errorf("部分图片上传失败: %s", strings.Join(errors, "; "))
	}

	return url, nil
}

// getImageContentTypeFromFilename 根据文件名返回对应的Content-Type
func getImageContentTypeFromFilename(filename string) string {
	ext := strings.ToLower(filepath.Ext(filename))
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".bmp":
		return "image/bmp"
	case ".svg":
		return "image/svg+xml"
	default:
		return ""
	}
}
