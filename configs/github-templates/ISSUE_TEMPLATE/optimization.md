---
name: Optimization Request
about: Request performance or code optimization
title: '[opt] '
labels: ['optimization', 'auto-modify']
assignees: ''

---

## 📈 Optimization Target
<!-- 描述需要优化的内容 -->

### What needs optimization?


### Current Performance Issue
<!-- 描述当前的性能问题 -->


### Expected Improvement
<!-- 预期的改进效果 -->


## 📊 Performance Metrics
<!-- 性能指标 -->

### Current Metrics
- Response Time: <!-- e.g., 2.5s -->
- Memory Usage: <!-- e.g., 512MB -->
- CPU Usage: <!-- e.g., 80% -->
- Database Query Time: <!-- e.g., 150ms -->
- Bundle Size: <!-- e.g., 2.1MB -->

### Target Metrics
- Response Time: <!-- e.g., <1s -->
- Memory Usage: <!-- e.g., <256MB -->
- CPU Usage: <!-- e.g., <50% -->
- Database Query Time: <!-- e.g., <50ms -->
- Bundle Size: <!-- e.g., <1.5MB -->

## 🔍 Optimization Scope
<!-- 优化范围 -->

### Component Type
- [ ] Frontend Performance
- [ ] Backend Performance
- [ ] Database Optimization
- [ ] API Optimization
- [ ] Memory Optimization
- [ ] Code Quality
- [ ] Bundle Size
- [ ] Load Time

### Affected Areas
- [ ] Database queries
- [ ] API endpoints
- [ ] Frontend components
- [ ] Image/asset loading
- [ ] Code bundling
- [ ] Caching strategy
- [ ] Algorithm efficiency

## 🛠 Technical Details
<!-- 技术细节 -->

### Profiling Results
<!-- 性能分析结果 -->
```
// 粘贴性能分析报告
```

### Bottleneck Analysis
<!-- 瓶颈分析 -->


### Suspected Issues
- [ ] N+1 query problem
- [ ] Large bundle size
- [ ] Inefficient algorithms
- [ ] Memory leaks
- [ ] Unnecessary re-renders
- [ ] Slow database queries
- [ ] Large image files
- [ ] Blocking operations

## 🎯 Optimization Strategy
<!-- 优化策略 -->

### Proposed Solutions
1.
2.
3.

### Implementation Approach
- [ ] Code refactoring
- [ ] Database optimization
- [ ] Caching implementation
- [ ] Asset optimization
- [ ] Algorithm improvement
- [ ] Infrastructure changes

### Files to Optimize
<!-- 需要优化的文件 -->
-
-

## 📏 Success Criteria
<!-- 成功标准 -->

### Performance Targets
- [ ] Response time improved by X%
- [ ] Memory usage reduced by X%
- [ ] Bundle size reduced by X%
- [ ] Database query time improved by X%

### Quality Metrics
- [ ] Code complexity reduced
- [ ] Test coverage maintained
- [ ] No functionality regression
- [ ] Documentation updated

## 🧪 Testing Plan
<!-- 测试计划 -->

### Performance Testing
- [ ] Load testing
- [ ] Stress testing
- [ ] Memory profiling
- [ ] Database performance testing

### Functional Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Regression testing

## 📋 Risk Assessment
<!-- 风险评估 -->

### Potential Risks
- [ ] Breaking changes
- [ ] Performance regression
- [ ] Compatibility issues
- [ ] Data integrity concerns

### Mitigation Strategy
<!-- 风险缓解策略 -->


## 📚 Additional Information
<!-- 额外信息 -->

### Related Issues


### Performance Tools Used
- [ ] Chrome DevTools
- [ ] Go pprof
- [ ] Database explain plans
- [ ] Bundle analyzers
- [ ] Custom profiling

### References
<!-- 相关资料 -->


---

<!--
🤖 Auto-optimization Instructions
This optimization request is eligible for automatic processing by CodeEvolve AI.

To enable auto-optimization, ensure:
1. Clear performance targets are defined
2. Specific bottlenecks are identified
3. Scope is well-defined and limited
4. Success criteria are measurable

The AI will:
- Analyze current performance issues
- Implement optimization strategies
- Measure improvement in sandbox
- Ensure no functionality regression
- Create PR with optimizations
-->

### 🔄 Auto-Optimization Enabled
- [ ] Yes, this can be automatically optimized
- [ ] No, manual optimization required

**Auto-optimization criteria:**
- [ ] Clear performance metrics provided
- [ ] Specific bottlenecks identified
- [ ] Limited scope (≤ 5 files)
- [ ] No architectural changes required
- [ ] Measurable success criteria

### ⚡ Optimization Priority
- [ ] Critical (performance severely impacted)
- [ ] High (noticeable performance issues)
- [ ] Medium (minor performance improvements)
- [ ] Low (code quality improvements)