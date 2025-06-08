'use client';

import { useEffect } from 'react';
import { useTranslation } from '../i18n';

export function DynamicHead() {
  const { currentLanguage } = useTranslation();

  useEffect(() => {
    const title = currentLanguage === 'zh' 
      ? 'JS Mitata 性能测试 | 专业的 JavaScript 性能基准测试平台' 
      : 'JS Mitata Benchmark | Professional JavaScript performance benchmarking platform';
    
    document.title = title;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      const description = currentLanguage === 'zh'
        ? '专业的JavaScript性能基准测试平台，提供实时代码分析、详细性能指标和可视化图表。测试、比较和优化您的JS代码性能。'
        : 'Professional JavaScript performance benchmarking platform with real-time code analysis, detailed metrics and visual charts. Test, compare and optimize your JS code performance.';
      metaDescription.setAttribute('content', description);
    }

    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    
    const keywords = currentLanguage === 'zh'
      ? 'JavaScript性能测试,JS基准测试,代码性能分析,性能优化工具,JavaScript速度测试,前端性能,代码比较,性能监控,JS性能优化,在线测试工具'
      : 'JavaScript performance,benchmark tool,JS performance test,code optimization,performance analysis,JavaScript speed test,frontend performance,code comparison,performance monitoring,JS optimization,online testing tool';
    
    metaKeywords.setAttribute('content', keywords);

    const updateMetaProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaProperty('og:title', title);
    updateMetaProperty('og:description', 
      currentLanguage === 'zh'
        ? '专业的JavaScript性能基准测试平台，实时分析代码性能，提供详细指标和可视化图表。'
        : 'Professional JavaScript performance benchmarking platform with real-time analysis, detailed metrics and visual charts.'
    );
    updateMetaProperty('og:locale', currentLanguage === 'zh' ? 'zh_CN' : 'en_US');

    const updateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateTwitterMeta('twitter:title', title);
    updateTwitterMeta('twitter:description',
      currentLanguage === 'zh'
        ? '专业的JavaScript性能基准测试平台，实时分析代码性能。'
        : 'Professional JavaScript performance benchmarking platform with real-time analysis.'
    );
  }, [currentLanguage]);

  useEffect(() => {
    const handleLanguageChange = () => {
      const savedLanguage = localStorage.getItem("mitata-language") || 'en';
      const title = savedLanguage === 'zh' 
        ? 'Mitata - JavaScript性能基准测试工具 | 在线JS性能分析平台' 
        : 'Mitata - JavaScript Performance Benchmark Tool | Online JS Performance Analysis';
      
      document.title = title;

      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        const description = savedLanguage === 'zh'
          ? '专业的JavaScript性能基准测试平台，提供实时代码分析、详细性能指标和可视化图表。测试、比较和优化您的JS代码性能。'
          : 'Professional JavaScript performance benchmarking platform with real-time code analysis, detailed metrics and visual charts. Test, compare and optimize your JS code performance.';
        metaDescription.setAttribute('content', description);
      }
    };

    window.addEventListener('language-change', handleLanguageChange);
    return () => {
      window.removeEventListener('language-change', handleLanguageChange);
    };
  }, []);

  return null;
} 