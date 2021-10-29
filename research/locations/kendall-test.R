# Instala pacotes para ler excel
# install.packages(c("readxl", "tcltk", "ggplot2", "here"))
library(readxl)
library(tcltk)
library(ggplot2)

options(warn=-1)
setwd(dirname(sys.frame(1)$ofile))

# Função para normlizar os dados
normalize = function(x) {
  if (sum(x) == 0) return (x)
  else return ((x - min(x)) / (max(x) - min(x)))
}

# Função auxiliar para pegar o nome do projeto a partir do nome do arquivo
getProjectName = function(fileName) {
  return (paste(tail(unlist(strsplit(fileName, .Platform$file.sep)), 2), collapse = "/"))
}

# Função que carrega os dados de um arquivo
loadFile = function (fileName) {
  dados = read.csv(fileName)
  dados = dados[dados$location != "UNKNOWN",]
  dados = dados[with(dados, order(-stargazers, -watchers, -issues, -pull_requests)),]
  return (dados)
}

# Função que carrega um arquivo e computa tau e p-values para diferentes top-x
compute = function(fileName) {
  projectName = getProjectName(fileName)
  dados = loadFile(fileName)

  # Função auxiliar para computar tau e p-value de um dataset (obtidos do csv)
  compute.aux = function(dados, top = NULL) {
    topLabel = if (is.null(top)) "ALL" else top
    top = if (is.null(top)) nrow(dados) else min(top, nrow(dados))

    # Faz uma cópia dos dados para as primeiras n linhas
    dados = droplevels(head(dados, top))

    # Alternativa para criar um ranking antes de aplicar
    # for (row in colnames(dados)[-1]) {
    #   dados[row] = rank(-dados[row], ties.method = "first")
    # }

    # Lê as colunas e cria os vetores
    stargazers = normalize(dados$stargazers)
    watchers = normalize(dados$watchers)
    issues = normalize(dados$issues)
    pullRequests = normalize(dados$pull_requests)

    pValues = c(metric="p-value", top=topLabel)
    taus = c(metric="tau", top=topLabel)

    # Realiza os testes entre os pares
    # stargazers x watchers|issues|pulls
    if (sum(stargazers) && sum(watchers)) {
      result = cor.test(stargazers, watchers, method="kendall")
      pValues = c(pValues, s.w=unname(result$p.value))
      taus = c(taus, s.w=unname(result$estimate))
    } else {
      pValues = c(pValues, s.w="")
      taus = c(taus, s.w="")
    }

    if (sum(stargazers) && sum(issues)) {
      result = cor.test(stargazers, issues, method="kendall")
      pValues = c(pValues, s.i=unname(result$p.value))
      taus = c(taus, s.i=unname(result$estimate))
    } else {
      pValues = c(pValues, s.i="")
      taus = c(taus, s.i="")
    }

    if (sum(stargazers) && sum(pullRequests)) {
      result = cor.test(stargazers, pullRequests, method="kendall")
      pValues = c(pValues, s.p=unname(result$p.value))
      taus = c(taus, s.p=unname(result$estimate))
    } else {
      pValues = c(pValues, s.p="")
      taus = c(taus, s.p="")
    }

    # watchers x issues|pulls
    if (sum(watchers) && sum(issues)) {
      result = cor.test(watchers, issues, method="kendall")
      pValues = c(pValues, w.i=unname(result$p.value))
      taus = c(taus, w.i=unname(result$estimate))
    } else {
      pValues = c(pValues, w.i="")
      taus = c(taus, w.i="")
    }

    if (sum(watchers) && sum(pullRequests)) {
      result = cor.test(watchers, pullRequests, method="kendall")
      pValues = c(pValues, w.p=unname(result$p.value))
      taus = c(taus, w.p=unname(result$estimate))
    } else {
      pValues = c(pValues, w.p="")
      taus = c(taus, w.p="")
    }

    # issues x pulls
    if (sum(issues) && sum(pullRequests)) {
      result = cor.test(issues, pullRequests, method="kendall")
      pValues = c(pValues, i.p=unname(result$p.value))
      taus = c(taus, i.p=unname(result$estimate))
    } else {
      pValues = c(pValues, i.p="")
      taus = c(taus, i.p="")
    }

    result = t(data.frame(tau=taus, p.value=pValues))
    rownames(result) = NULL

    return (result)
  }

  df = NULL;

  for (top in c(5, 10, 25, 50, 100, 250)) {
    if (nrow(dados) >= top) {
      result = data.frame(repo=projectName, compute.aux(dados, top))
      if (is.null(df)) df = result
      else df = rbind(df, result)
    }
  }

  return (rbind(df, data.frame(repo=projectName, compute.aux(dados))));
}

# Lê arquivos csv e computa os valores de todos arquivos de um diretório
computeAll = function(filesList) {
  df = NULL

  for (file in filesList) {
    result = compute(file)
    if (is.null(df)) df = result
    else df = rbind(df, result)
  }

  return (df)
}

# Função que plota os rankings de um determinado projeto
exportsRankings = function (filesList, top = NULL) {
  plots = list()

  # itera sobre a lista de arquivos
  for (fileName in filesList) {
    dados = loadFile(fileName)
    if (!is.null(top)) dados = droplevels(head(dados, top))
    dados$location = factor(dados$location, levels = dados$location[order(-dados$stargazers)])

    df = data.frame(metrica="stargazers", location=dados$location, ranking=rank(-dados$stargazers, ties.method = "first"))
    if (sum(dados$watchers)) df = rbind(df, data.frame(metrica="watchers", location=dados$location, ranking=rank(-dados$watchers, ties.method = "first")))
    if (sum(dados$issues)) df = rbind(df, data.frame(metrica="issues", location=dados$location, ranking=rank(-dados$issues, ties.method = "first")))
    if (sum(dados$pull_requests)) df = rbind(df, data.frame(metrica="pull_requests", location=dados$location, ranking=rank(-dados$pull_requests, ties.method = "first")))

    plot = ggplot(data = df, aes(x = metrica, y = ranking, group = location)) +
      theme_classic() +
      geom_line(aes(color = location), size = 1) +
      geom_point(aes(color = location), size = 2) +
      scale_y_reverse(breaks = 1:nrow(df)) +
      labs(title = getProjectName(fileName)) +
      xlab(NULL) +
      theme(plot.title = element_text(hjust = 0.5))

    plots = append(plots, list(plot))
  }

  return (plots)
}

# Função que computa e retorna os resultados do kendall para todos os projetos
exportsKendallResults = function(filesList) {
  results = computeAll(filesList)
  results.tau = droplevels(results[results$metric == "tau",])

  plots = list()

  for (top in c(5, 10, 25, 50, 100, 250, "ALL")) {
    results.filtered = droplevels(results.tau[results.tau$top == paste(top),])

    if (nrow(results.filtered)) {

      df = droplevels(rbind(
        data.frame(thu=as.numeric(as.character(results.filtered$s.w)), metric="St x Wa"),
        data.frame(thu=as.numeric(as.character(results.filtered$s.i)), metric="St x Is"),
        data.frame(thu=as.numeric(as.character(results.filtered$s.p)), metric="St x Pu"),
        data.frame(thu=as.numeric(as.character(results.filtered$w.i)), metric="Wa x Is"),
        data.frame(thu=as.numeric(as.character(results.filtered$w.p)), metric="Wa x Pu"),
        data.frame(thu=as.numeric(as.character(results.filtered$i.p)), metric="Is x Pu")
      ))


      plot = ggplot(df, aes(x = metric, y = thu)) +
        geom_boxplot(notch = FALSE) +
        theme_classic() +
        ylim(min(df$thu, na.rm = TRUE), 1) +
        labs(title = paste("top-", tolower(top), sep = ""), x = "", y = expression("coeficiente "~italic("tau"))) +
        theme(plot.title = element_text(hjust = 0.5))

      plots = append(plots, list(plot))
    }
  }

  return (list(results=results, plots=plots))
}

# Processa e visualiza os resultados obtidos
dir = tk_choose.dir()
files = list.files(path = dir, pattern = ".csv$" , recursive = T, full.names = T)

pdf(file = file.path(".results", "kendall-test.rankings.pdf"))
for (rankingPlot in exportsRankings(files, 25)) plot(rankingPlot)
dev.off()

pdf(file = file.path(".results", "kendall-test.plots.pdf"))
kendallReults = exportsKendallResults(files)
for (kendallPlot in kendallReults$plots) plot(kendallPlot)
dev.off()

write.csv(kendallReults$results, file = file.path(".results", "kendall-test.csv"), sep = ",", row.names = FALSE)
