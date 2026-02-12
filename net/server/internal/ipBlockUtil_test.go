package databag

import (
	"testing"
)

func TestCalculateBlockDuration(t *testing.T) {
	baseDuration := int64(1)
	maxDuration := int64(168)

	tests := []struct {
		failCount   int
		expected    int64
		description string
	}{
		{1, 1, "首次失败应该为基础时长"},
		{2, 2, "第二次失败应该为2倍基础时长"},
		{3, 4, "第三次失败应该为4倍基础时长"},
		{4, 8, "第四次失败应该为8倍基础时长"},
		{5, 16, "第五次失败应该为16倍基础时长"},
		{10, 512, "第十次失败应该为512倍基础时长"},
		{15, 168, "超过最大时长应该限制为最大值"},
	}

	for _, test := range tests {
		result := calculateBlockDuration(test.failCount, baseDuration, maxDuration)
		if result != test.expected {
			t.Errorf("测试失败: %s, 失败次数: %d, 期望: %d, 实际: %d",
				test.description, test.failCount, test.expected, result)
		}
	}
}

func TestIPTimeWindowLogic(t *testing.T) {
	// 这个测试需要数据库，实际环境中应该在测试数据库中运行
	// 这里只是展示测试逻辑

	// 模拟首次失败
	// 在实际测试中，这里应该调用 RecordIPAuthFailure("192.168.1.100")
	// 然后验证 LastFailTime 是否正确设置

	// 模拟时间窗口外的失败
	// 等待超过 failPeriod 时间后再次调用
	// 验证计数是否重置为1

	t.Log("时间窗口逻辑测试需要数据库环境")
}

func TestIPCache(t *testing.T) {
	// 测试IP缓存功能

	// 清除可能存在的缓存
	ipCache.Delete("192.168.1.200")

	// 模拟检查IP状态
	// 需要设置测试数据库

	t.Log("IP缓存测试需要数据库环境")
}
